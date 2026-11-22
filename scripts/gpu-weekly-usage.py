"""Accumulate weekly GPU usage by account from the public dashboard."""

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
SAMPLE_MINUTES = 5
H100_SXM_BF16 = 989.4
# NVIDIA Hopper, Ada, and RTX Blackwell architecture whitepapers and card datasheets.
# Dense BF16 Tensor Core TFLOPS.
DENSE_BF16 = {
    "H100 80GB HBM3": H100_SXM_BF16,
    "H100 SXM": H100_SXM_BF16,
    "H100 PCIe": 756.0,
    "H100 NVL": 835.5,
    "H200 SXM": H100_SXM_BF16,
    "H200 NVL": 835.5,
    "A100 80GB PCIe": 312.0,
    "A100-PCIE-40GB": 312.0,
    "L40": 181.05,
    "L40S": 362.05,
    "RTX A6000": 154.8,
    "RTX 6000 Ada Generation": 364.0,
    "RTX PRO 6000 Blackwell Max-Q Workstation Edition": 438.9,
    "RTX PRO 6000 Blackwell Workstation Edition": 503.8,
}
# For cards without BF16, use vendor-rated FP16 Tensor throughput or FP32
# CUDA throughput if the card has no Tensor Cores.
LEGACY_PEAK = {
    "Tesla V100-PCIE-32GB": 112.0,
    "Tesla V100-SXM2-32GB": 125.0,
    "TITAN RTX": 130.0,
    "TITAN V": 110.0,
    "GeForce GTX 1080": 8.9,
    "GeForce GTX 1080 Ti": 11.3,
    "TITAN X (Pascal)": 11.0,
    "GeForce GTX TITAN X": 7.0,
}


def tally(cards, previous, now, sample_minutes=SAMPLE_MINUTES):
    year, week, _ = now.isocalendar()
    label = f"{year}-W{week:02d}"
    slot_width = 60 * sample_minutes
    slot_start = int(now.timestamp()) // slot_width * slot_width
    last_source = previous.get("source_time", "")
    timestamps = []
    current = Counter()
    rated = Counter()
    equivalent = Counter()
    by_hour = {}
    capacity_mib = 0
    capacity_h100 = 0
    for card in cards.values():
        model = str(card.get("name", "")).removeprefix("NVIDIA ").strip()
        score = DENSE_BF16.get(model) or LEGACY_PEAK.get(model)
        capacity = MIB.fullmatch(str(card.get("mem_total", "")))
        capacity = int(capacity.group(1)) if capacity else 0
        capacity_mib += capacity
        capacity_h100 += (score or 0) / H100_SXM_BF16
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
        hour_memory, hour_rated, hour_compute = by_hour.setdefault(timestamp[:13], (Counter(), Counter(), Counter()))
        card_usage = Counter()
        for process in card.get("processes", []):
            account = process.get("user")
            memory = MIB.fullmatch(str(process.get("used_memory", "")))
            if isinstance(account, str) and account.strip() and memory:
                card_usage[account.strip()] += int(memory.group(1))
        for nickname, mib in card_usage.items():
            current[nickname] += mib
            hour_memory[nickname] += mib
            if score and 0 < mib <= capacity:
                rated[nickname] += mib
                hour_rated[nickname] += mib
                hours = score / H100_SXM_BF16 * (mib / capacity) * sample_minutes / 60
                equivalent[nickname] += hours
                hour_compute[nickname] += hours

    totals = {
        row["nickname"]: {
            "nickname": row["nickname"],
            "mib_minutes": row["mib_minutes"],
            "rated_mib_minutes": row.get("rated_mib_minutes", 0),
            "h100_hours": row.get("h100_hours", 0),
        }
        for row in previous.get("ranking", [])
        if previous.get("week") == label and previous.get("identity") == "account"
    }
    # The previous schema stored the index of a five-minute bucket.
    last_slot_end = previous.get("slot_end", (previous.get("slot", -1) + 1) * 300)
    newest = max(timestamps, default="")
    cutoff = (now.date() - timedelta(days=30)).isoformat()
    daily = {
        date: rows for date, rows in previous.get("daily", {}).items()
        if date >= cutoff and previous.get("identity") == "account"
    }
    hourly = {hour: rows for hour, rows in previous.get("hourly", {}).items() if hour[:10] >= cutoff}

    def accumulate(rows, memory, rated_memory, compute):
        for nickname, mib in memory.items():
            if mib:
                row = rows.setdefault(nickname, {
                    "nickname": nickname, "mib_minutes": 0,
                    "rated_mib_minutes": 0, "h100_hours": 0,
                })
                row["mib_minutes"] += mib * sample_minutes
                row["rated_mib_minutes"] += rated_memory[nickname] * sample_minutes
                row["h100_hours"] += compute[nickname]

    if newest > last_source and slot_start >= last_slot_end:
        last_slot_end, last_source = slot_start + slot_width, newest
        accumulate(totals, current, rated, equivalent)
        for hour, usage in by_hour.items():
            date = hour[:10]
            hour_rows = {row["nickname"]: dict(row) for row in hourly.get(hour, [])}
            accumulate(hour_rows, *usage)
            hourly[hour] = list(hour_rows.values())
            rows = {row["nickname"]: dict(row) for row in daily.get(date, [])}
            accumulate(rows, *usage)
            daily[date] = list(rows.values())
    return {
        "week": label,
        "identity": "account",
        "slot_end": last_slot_end,
        "source_time": last_source,
        "daily": daily,
        "hourly": hourly,
        "capacity": {"mib": capacity_mib, "h100": capacity_h100} if capacity_mib else previous.get("capacity"),
        "ranking": sorted(totals.values(), key=lambda row: (-row["mib_minutes"], row["nickname"])),
    }


def main(state_path, output_path):
    sample_minutes = int(os.getenv("GPU_SAMPLE_MINUTES", str(SAMPLE_MINUTES)))
    if sample_minutes not in (3, 5):
        raise ValueError("Unsupported sampling interval")
    previous = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    with urlopen(SOURCE, timeout=20) as response:
        html = response.read(16 * 1024 * 1024).decode("utf-8")
    match = SNAPSHOT.search(html)
    if not match:
        raise ValueError("Dashboard snapshot missing")
    cards = json.loads(match.group(1))
    output = tally(cards, previous, datetime.now(JST), sample_minutes)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Weekly snapshot processed.")


if __name__ == "__main__":
    try:
        main(Path(sys.argv[1]), Path(sys.argv[2]))
    except Exception as error:
        print(f"Weekly snapshot failed: {type(error).__name__}", file=sys.stderr)
        raise SystemExit(1)
