from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE = REPO_ROOT / 'ABEJO_CHARLIE_JAMES_RESUME.pdf'
GENERATOR = REPO_ROOT / 'scripts' / 'generate_resume.py'


class ResumeExportTest(unittest.TestCase):
    def test_export_preserves_the_supplied_resume_byte_for_byte(self):
        original = SOURCE.read_bytes()
        self.assertTrue(original.startswith(b'%PDF-'))
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / 'nested' / 'resume.pdf'
            subprocess.run([sys.executable, str(GENERATOR), str(output)], cwd=REPO_ROOT, check=True, capture_output=True)
            self.assertEqual(output.read_bytes(), original)
        self.assertEqual(SOURCE.read_bytes(), original)

    def test_exporting_to_source_does_not_overwrite_the_resume(self):
        original = SOURCE.read_bytes()
        subprocess.run([sys.executable, str(GENERATOR), str(SOURCE)], cwd=REPO_ROOT, check=True, capture_output=True)
        self.assertEqual(SOURCE.read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
