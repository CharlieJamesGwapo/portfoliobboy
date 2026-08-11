# Complete Certificate Resume Update

## Goal

Keep the portfolio and downloadable resume consistent by changing Rooche Digital Company to `Oct 2025 - Dec 2025` everywhere and including all 23 certificate and technical-training records from the portfolio in the resume. Preserve the existing five authentic Claude/Anthropic certificate images and links in the portfolio gallery.

## Chosen approach

Use a compact, ATS-readable certification inventory in the existing resume rather than adding certificate images to the PDF. The resume will name every portfolio certification with its issuer and available issue date, while the portfolio remains the visual proof source for the five uploaded Anthropic certificates.

This approach is preferred because it keeps the PDF selectable, searchable, and recruiter-friendly. Embedding five certificate images would increase file size and weaken text extraction, while listing only selected credentials would not match the user's request to include the other certificates.

## Content changes

- Change Rooche Digital Company from `Jan 2026 - Mar 2026` to `Oct 2025 - Dec 2025` in the main portfolio experience data, the game experience data, and the resume generator.
- Replace the resume's selected five-item certification list with all 23 records from the portfolio.
- Group the resume records into `Anthropic & AI` and `Technical & professional` so recruiters can scan them quickly.
- Include all 11 Anthropic records, including the five image-backed certificates:
  - Introduction to Model Context Protocol
  - Teaching the AI Fluency Framework
  - Claude 101
  - Building with the Claude API
  - AI Fluency: Framework & Foundations
- Include the remaining 12 technical and professional records from Java, Go, HTML/CSS/JavaScript, full-stack development, SQL, Microsoft/Windows Server, Active Directory, MongoDB training, and PHP.
- Keep the existing education and academic recognitions unchanged.
- Do not add certificate images to the PDF or remove any existing technology skills.

## Layout

- Keep the existing Letter-sized, human-first resume design.
- Use compact category labels and readable wrapped text for certifications.
- Prefer a two-page output. If all 23 records cannot remain legible within two pages, allow a clean third page rather than shrinking text below a professional reading size.
- Preserve selectable text, clickable contact/project links, consistent spacing, and the existing footer.

## Verification and release

- Add a regression test that fails unless Rooche uses `Oct 2025 - Dec 2025` in both portfolio data sources and all 23 credentials remain present with the five uploaded image records.
- Regenerate the PDF and confirm extracted text contains the corrected Rooche dates, all 11 Anthropic credential titles, and representative technical credentials.
- Render and inspect every PDF page for clipping, overlap, poor wrapping, and illegible text.
- Run the complete test suite and Vite production build.
- Commit and push `main`, deploy the verified production build to Vercel, and verify the public portfolio and downloadable PDF.
