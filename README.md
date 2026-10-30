# S01E03: what it shows

This repository contains the public deliverables for MEGA.dev challenge S01E03:
one issue per distinct problem in support ticket #4471, plus the signed knowledge-base
page and its rendered version.

The page uses a sanitized projection of the course export. It retains report IDs, dates,
channels, intake labels, body-shape classifications, and pseudonymous tenant keys; it
does not include report subjects, report bodies, or tenant names.

Build the static site with `npm install` followed by `npm run build`. The page is served
at `/kb/incidents/4471-split/`; a standalone rendered snapshot is committed at
`rendered/4471-split.html`.
