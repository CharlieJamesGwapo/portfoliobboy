from __future__ import annotations

import hashlib
import os
from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SHA256 = "ffe82da88e664d43d931bcf7f96f620b3efb58cc32d9bd35c18dffc33f18ff60"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class ResumeAssetTest(unittest.TestCase):
    def test_public_resume_is_the_canonical_pdf(self) -> None:
        path = REPO_ROOT / "public" / "charlie-james-abejo-resume.pdf"
        self.assertTrue(path.is_file())
        self.assertEqual(sha256(path), EXPECTED_SHA256)
        self.assertGreater(path.stat().st_size, 500_000)

    @unittest.skipUnless(os.environ.get("VERIFY_DIST") == "1", "release build check")
    def test_built_resume_preserves_the_same_bytes(self) -> None:
        path = REPO_ROOT / "dist" / "charlie-james-abejo-resume.pdf"
        self.assertTrue(path.is_file())
        self.assertEqual(sha256(path), EXPECTED_SHA256)


if __name__ == "__main__":
    unittest.main()
