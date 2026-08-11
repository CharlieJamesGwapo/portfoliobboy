from __future__ import annotations

from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
GENERATOR = REPO_ROOT / "scripts" / "generate_resume.py"

EXPECTED_CERTIFICATES = [
    "Model Context Protocol: Advanced Topics",
    "Introduction to Agent Skills",
    "AI Fluency for Builders",
    "Introduction to Model Context Protocol",
    "AI Capabilities and Limitations",
    "Claude Code in Action",
    "Introduction to Subagents",
    "Teaching the AI Fluency Framework",
    "Claude 101",
    "Building with the Claude API",
    "AI Fluency: Framework & Foundations",
    "Java SE 8 Programmer I",
    "Go Programming",
    "Programming in HTML5 with JavaScript and CSS3",
    "Full-Stack Web Development Certification",
    "Databases with SQL",
    "Manage AD DS Domain Controllers & FSMO Roles",
    "Windows Server 2012 Training",
    "Active Directory",
    "MongoDB Database Training",
    "PHP for Web Development",
    "JavaScript Programming",
    "HTML and CSS",
]


class ResumeContentTest(unittest.TestCase):
    def test_generated_resume_matches_portfolio_dates_and_certificates(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_path = Path(temporary_directory) / "resume.pdf"
            subprocess.run(
                [sys.executable, str(GENERATOR), str(output_path)],
                cwd=REPO_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            extracted = subprocess.run(
                ["pdftotext", "-layout", str(output_path), "-"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout

        normalized = " ".join(extracted.split())
        self.assertIn("Full-Stack Developer - Rooche Digital Company Oct 2025 - Dec 2025", normalized)
        self.assertNotIn("Jan 2026 - Mar 2026", normalized)
        for certificate in EXPECTED_CERTIFICATES:
            with self.subTest(certificate=certificate):
                self.assertIn(certificate, normalized)


if __name__ == "__main__":
    unittest.main()
