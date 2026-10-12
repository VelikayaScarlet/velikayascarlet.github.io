"""Build public creation updates from committed content changes."""
import argparse
import json
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GROUPS = [
    ("creations/stories/", "事物替我们说话", "/creations/stories/yexing/"),
    ("creations/essays/归绥杂记/", "归绥杂记", "/creations/guisui-zaji/"),
    ("creations/essays/联合军前传/", "联合军前传", "/creations/cmbpre/"),
    ("creations/essays/玻璃蒂克/", "玻璃蒂克", "/creations/political/"),
    ("assets/encrypted/political.json", "玻璃蒂克", "/creations/political/"),
    ("creations/essays/别利语/", "别利语简述", "/creations/bielian/"),
    ("creations/essays/刘彬回忆录之我的大学/", "刘彬回忆录——我的大学", "/creations/liubin-memoir/"),
]


def git(*args):
    return subprocess.check_output(
        ["git", "--git-dir=" + str(ROOT / ".git"), "--work-tree=" + str(ROOT), *args],
        cwd=ROOT,
        stderr=subprocess.DEVNULL,
    )


def group(path):
    if path.startswith("creations/poems/") and path.endswith(".pdf"):
        return Path(path).stem, "/" + path
    for prefix, name, url in GROUPS:
        if path.startswith(prefix):
            return name, url
    return None


def content(rev, path):
    try:
        raw = git("show", rev + ":" + path)
    except subprocess.CalledProcessError:
        return None
    if path.endswith(".md"):
        text = raw.decode("utf-8-sig").replace("\r\n", "\n")
        if text.startswith("---\n"):
            parts = text.split("---\n", 2)
            if len(parts) == 3:
                text = parts[2]
        return text.strip()
    return raw


def build():
    updates = []
    commits = git("log", "--first-parent", "--format=%H%x09%cI", "--",
                  "creations/poems", "creations/stories", "creations/essays",
                  "assets/encrypted/political.json").decode().splitlines()
    for record in commits:
        sha, date = record.split("\t", 1)
        parents = git("rev-list", "--parents", "-n", "1", sha).decode().split()[1:]
        args = ("diff", "--name-only", "--diff-filter=AM", "-z", parents[0], sha) if parents else (
            "diff-tree", "--root", "--no-commit-id", "--name-only", "-r", "--diff-filter=AM", "-z", sha)
        paths = git(*args).decode("utf-8").split("\0")
        changed = {}
        for path in paths:
            target = group(path)
            if not target or not (ROOT / path).is_file():
                continue
            if parents and path.endswith(".md") and content(sha, path) == content(parents[0], path):
                continue
            changed[target] = True
        stamp = datetime.fromisoformat(date).astimezone(timezone(timedelta(hours=9)))
        for name, url in changed:
            updates.append({"date": stamp.isoformat(), "title": name, "url": url})
    return {"updates": sorted(updates, key=lambda item: item["date"], reverse=True)[:300]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="assets/data/creation-updates.json")
    args = parser.parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

