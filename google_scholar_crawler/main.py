"""Fetch citation statistics via SerpApi (Google Scholar) or OpenAlex (ORCID).

- If SERPAPI_KEY is set, queries Google Scholar Author data via SerpApi for exact
  Google Scholar citation counts.
- Otherwise, falls back to the free, official OpenAlex API using ORCID with zero
  API keys or third-party dependencies.
"""

from datetime import datetime, timezone
import json
import os
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DEFAULT_SCHOLAR_ID = "IUd0Hj8AAAAJ"
DEFAULT_ORCID = "0009-0008-8365-4064"
CONTACT_EMAIL = "velikayascarlet@gmail.com"
USER_AGENT = f"velikayascarlet-homepage/1.0 (mailto:{CONTACT_EMAIL})"


def fetch_json(url: str) -> dict:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_via_serpapi(author_id: str, api_key: str) -> dict:
    query = urlencode({
        "engine": "google_scholar_author",
        "author_id": author_id,
        "api_key": api_key,
    })
    data = fetch_json(f"https://serpapi.com/search.json?{query}")
    if "error" in data:
        raise RuntimeError(f"SerpApi error: {data['error']}")

    citedby = 0
    for row in data.get("cited_by", {}).get("table", []):
        if "citations" in row:
            citedby = int(row["citations"].get("all", 0))
            break

    publications = {}
    for article in data.get("articles", []):
        pub_id = article.get("citation_id")
        if not pub_id:
            continue
        publications[pub_id] = {
            "author_pub_id": pub_id,
            "bib": {
                "title": article.get("title", ""),
                "pub_year": article.get("year", ""),
            },
            "num_citations": int((article.get("cited_by") or {}).get("value") or 0),
        }

    return {
        "source": "serpapi-google-scholar",
        "name": (data.get("author") or {}).get("name", "Tian Lan"),
        "scholar_id": author_id,
        "citedby": citedby,
        "updated": datetime.now(timezone.utc).isoformat(),
        "publications": publications,
    }


def fetch_via_openalex(orcid: str) -> dict:
    clean_orcid = orcid.strip().removeprefix("https://orcid.org/").removeprefix("http://orcid.org/")
    query = urlencode({"mailto": CONTACT_EMAIL})
    data = fetch_json(f"https://api.openalex.org/authors/https://orcid.org/{clean_orcid}?{query}")

    stats = data.get("summary_stats") or {}
    return {
        "source": "openalex",
        "name": data.get("display_name", "Tian Lan"),
        "orcid": clean_orcid,
        "citedby": int(data.get("cited_by_count") or 0),
        "works_count": int(data.get("works_count") or 0),
        "hindex": int(stats.get("h_index") or 0),
        "i10index": int(stats.get("i10_index") or 0),
        "counts_by_year": data.get("counts_by_year", []),
        "updated": datetime.now(timezone.utc).isoformat(),
        "publications": {},
    }


def main() -> None:
    serpapi_key = os.getenv("SERPAPI_KEY", "").strip()
    scholar_id = os.getenv("GOOGLE_SCHOLAR_ID", "").strip() or DEFAULT_SCHOLAR_ID
    orcid = os.getenv("ORCID", "").strip() or DEFAULT_ORCID

    if serpapi_key:
        author = fetch_via_serpapi(scholar_id, serpapi_key)
    else:
        author = fetch_via_openalex(orcid)

    print(json.dumps(author, indent=2, ensure_ascii=False))

    os.makedirs("results", exist_ok=True)
    with open("results/gs_data.json", "w", encoding="utf-8") as outfile:
        json.dump(author, outfile, ensure_ascii=False, indent=2)

    shieldio_data = {
        "schemaVersion": 1,
        "label": "citations",
        "message": str(author["citedby"]),
    }
    with open("results/gs_data_shieldsio.json", "w", encoding="utf-8") as outfile:
        json.dump(shieldio_data, outfile, ensure_ascii=False)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Citation fetch failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
