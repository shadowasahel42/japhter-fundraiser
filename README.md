# Medical Aid Poster Generator — Japhter Rono

A client-side poster/invitation generator. No backend, no build step — just three files plus an empty `assets/` folder for your own reference images if you want them.

## Deploy to GitHub Pages
1. Create a new GitHub repo and add `index.html`, `style.css`, `script.js` (and `assets/` if you use it) to the root.
2. Push to GitHub.
3. In the repo: **Settings → Pages → Deploy from a branch → main / (root)**.
4. Your generator will be live at `https://<username>.github.io/<repo>/`.

## Using it
- **Invitee** — pick a title (or "Custom title…") and type a name; the poster's "Dear …" line updates live.
- **Japhter's photo** — upload, then adjust scale, position and visibility with the sliders. Nothing is uploaded anywhere; the image stays in your browser.
- **M-PESA icon** — upload your own M-PESA image (the app never fabricates one) and resize it to fit the payment box.
- **Participant list** — add names one at a time, or upload a PDF, DOCX, XLS or XLSX list and the app will pull out likely name rows/lines automatically (review and correct the list afterwards — automatic extraction isn't perfect). Note: legacy binary `.doc` files can't be parsed in-browser; save as `.docx` first.
- **Generate**
  - *Download JPG (current)* — exports exactly what's in the preview.
  - *Generate & download selected / all* — renders one JPG per checked/listed participant and downloads them together as a ZIP.

All processing (PDF/Word/Excel parsing, image handling, JPG rendering) happens locally in the browser via pdf.js, mammoth.js, SheetJS, html2canvas and JSZip, loaded from cdnjs — so the site keeps working on GitHub Pages with no server of its own.

## Notes
- The core event details (names, hospital, date, venue, treasurer, phone number) are hard-coded in `index.html` exactly as supplied and are not meant to be edited through the UI — edit the HTML directly if any of that information changes.
- Colors are restricted to the approved blue/white palette in `style.css` (`:root` variables) — change them there if needed, but keep to solid colors (no gradients) to stay consistent with the design brief.
