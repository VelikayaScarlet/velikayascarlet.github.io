import json
import re
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


STATS_URL = "https://mapmyvisitors.com/web/1bz2b"


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        text = data.strip()
        if text:
            self.parts.append(text)


def fetch_pageviews():
    request = Request(
        STATS_URL,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
            )
        },
    )

    last_error = None
    for attempt in range(3):
        try:
            with urlopen(request, timeout=30) as response:
                html = response.read().decode("utf-8", errors="replace")

            parser = TextExtractor()
            parser.feed(html)
            text = " ".join(parser.parts)
            match = re.search(r"Total\s+Pageviews\s*([\d,]+)", text, re.IGNORECASE)
            if not match:
                raise RuntimeError("Could not find Total Pageviews on the statistics page")
            return int(match.group(1).replace(",", ""))
        except Exception as error:
            last_error = error
            if attempt < 2:
                time.sleep(5 * (attempt + 1))

    raise RuntimeError(f"Failed to fetch profile views: {last_error}")


def main():
    total_pageviews = fetch_pageviews()
    output_dir = Path(__file__).resolve().parent / "results"
    output_dir.mkdir(parents=True, exist_ok=True)
    output = {
        "total_pageviews": total_pageviews,
        "updated": datetime.now(timezone.utc).isoformat(),
        "source": STATS_URL,
    }
    with (output_dir / "profile_views.json").open("w", encoding="utf-8") as file:
        json.dump(output, file, ensure_ascii=False, indent=2)
        file.write("\n")
    print(json.dumps(output, ensure_ascii=False))


if __name__ == "__main__":
    main()
