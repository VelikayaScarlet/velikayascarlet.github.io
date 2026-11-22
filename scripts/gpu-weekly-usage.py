"""Accumulate public weekly totals for consenting participants only."""

import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import urlopen

SOURCE = "https://lotus.kuee.kyoto-u.ac.jp/~linuxbrew/gpus-web/"
JST = timezone(timedelta(hours=9))
MIB = re.compile(r"\s*(\d+)\s*MiB\s*")
SNAPSHOT = re.compile(r'<script\b[^>]*\bid="gpuDetailsData"[^>]*>(.*?)</script>', re.S)


def tally(cards, names, previous, now):
    year, week, _ = now.isocalendar()
    label = f"{year}-W{week:02d}"
    slot = int(now.timestamp()) // 300
    last_source = previous.get("source_time", "")
    timestamps = []
    current = Counter()
    for card in cards.values():
        timestamp = card.get("timestamp", "")
        try:
            sampled = datetime.fromisoformat(timestamp.replace("/", "-")).replace(tzinfo=JST)
        except (AttributeError, ValueError):
            continue
        timestamp = sampled.isoformat()
        if not timedelta(minutes=-1) <= now - sampled <= timedelta(minutes=8):
            continue
        timestamps.append(timestamp)
        if timestamp <= last_source:
            continue
        for process in card.get("processes", []):
            nickname = names.get(process.get("user"))
            memory = MIB.fullmatch(str(process.get("used_memory", "")))
            if nickname is not None and memory:
                current[nickname] += int(memory.group(1))

    approved = set(names.values())
    totals = {
        row["nickname"]: row["mib_minutes"]
        for row in previous.get("ranking", [])
        if previous.get("week") == label and row["nickname"] in approved
    }
    last_slot = previous.get("slot", -1)
    newest = max(timestamps, default="")
    if newest > last_source and slot > last_slot:
        last_slot, last_source = slot, newest
        for nickname, mib in current.items():
            if mib:
                totals[nickname] = totals.get(nickname, 0) + mib * 5
    return {
        "week": label,
        "slot": last_slot,
        "source_time": last_source,
        "ranking": [
            {"nickname": nickname, "mib_minutes": amount}
            for nickname, amount in sorted(totals.items(), key=lambda item: (-item[1], item[0]))
        ],
    }


def main(state_path, output_path):
    names = json.loads(os.getenv("GPU_USAGE_OPT_IN") or "{}")
    if not isinstance(names, dict) or any(
        not isinstance(name, str) or not name.strip() or len(name) > 32
        for name in names.values()
    ) or len(set(names.values())) != len(names):
        raise ValueError("Invalid opt-in settings")
    previous = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    cards = {}
    if names:
        with urlopen(SOURCE, timeout=20) as response:
            html = response.read(16 * 1024 * 1024).decode("utf-8")
        match = SNAPSHOT.search(html)
        if not match:
            raise ValueError("Dashboard snapshot missing")
        cards = json.loads(match.group(1))
    output = tally(cards, names, previous, datetime.now(JST))
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Weekly snapshot processed." if names else "No opt-in list configured; did not fetch.")


if __name__ == "__main__":
    try:
        main(Path(sys.argv[1]), Path(sys.argv[2]))
    except Exception as error:
        print(f"Weekly snapshot failed: {type(error).__name__}", file=sys.stderr)
        raise SystemExit(1)
