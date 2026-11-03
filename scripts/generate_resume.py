#!/usr/bin/env python3
"""Export the supplied, canonical resume without regenerating outdated content.

The portfolio serves ABEJO_CHARLIE_JAMES_RESUME.pdf. Replace that source with a
new approved resume to update both the website and this export utility.
"""
from pathlib import Path
import shutil
import sys

SOURCE = Path(__file__).resolve().parents[1] / 'ABEJO_CHARLIE_JAMES_RESUME.pdf'


def build_resume(output: Path) -> None:
    if not SOURCE.read_bytes().startswith(b'%PDF-'):
        raise ValueError('The canonical resume is not a PDF')
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.resolve() != SOURCE.resolve():
        shutil.copyfile(SOURCE, output)


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf')
    build_resume(output)
    print(output.resolve())


if __name__ == '__main__':
    main()
