(function () {
  'use strict';

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  /* ---------------- STATE ---------------- */
  const state = { title: '', customTitle: '', name: '', participants: [] };
  let nextId = 1;

  /* ---------------- DOM ---------------- */
  const $ = (id) => document.getElementById(id);

  const titleSelect = $('titleSelect');
  const customTitleField = $('customTitleField');
  const customTitleInput = $('customTitleInput');
  const nameInput = $('nameInput');

  const manualTitle = $('manualTitle');
  const manualName = $('manualName');
  const manualAddBtn = $('manualAddBtn');
  const listInput = $('listInput');
  const importStatus = $('importStatus');
  const participantBody = $('participantBody');
  const emptyListHint = $('emptyListHint');
  const selectAllBox = $('selectAllBox');

  const downloadCurrentBtn = $('downloadCurrentBtn');
  const generateSelectedBtn = $('generateSelectedBtn');
  const generateAllBtn = $('generateAllBtn');
  const generateStatus = $('generateStatus');

  const poster = $('poster');
  const posterScaler = $('posterScaler');
  const previewFrame = $('previewFrame');
  const posterInviteeName = $('posterInviteeName');
  const zoomBtn = $('zoomBtn');

  const POSTER_W = 960;
  const POSTER_H = 540;

  /* ---------------- HELPERS ---------------- */
  function displayName(title, custom, name) {
    const t = title === '__custom' ? (custom || '').trim() : (title || '').trim();
    const n = (name || '').trim();
    if (!n) return 'Esteemed Guest';
    return t ? `${t}. ${n}`.replace(/\.\.$/, '.') : n;
  }

  function slugify(text) {
    return (
      (text || 'invitation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'invitation'
    );
  }

  /* ---------------- FIT + SCALE ----------------
     The poster is always 960 × 540. If a long name or wrapped text would
     overflow, every font size shrinks together (via --fit) until it fits. */
  function fitPoster(el) {
    const col = el.querySelector('.poster__content-col');
    let f = 1;
    el.style.setProperty('--fit', '1');
    while (col.scrollHeight > col.clientHeight + 1 && f > 0.6) {
      f = Math.round((f - 0.03) * 100) / 100;
      el.style.setProperty('--fit', String(f));
    }
  }

  let zoomed = false;
  function layoutPreview() {
    const cs = getComputedStyle(previewFrame);
    const avail =
      previewFrame.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight);
    const s = zoomed ? 0.75 : Math.min(1, avail / POSTER_W);
    posterScaler.style.width = zoomed ? `${POSTER_W * s}px` : '100%';
    posterScaler.style.height = `${POSTER_H * s}px`;
    poster.style.transform = `scale(${s})`;
    zoomBtn.textContent = zoomed ? 'Fit to screen' : 'Zoom preview';
  }

  zoomBtn.addEventListener('click', () => {
    zoomed = !zoomed;
    layoutPreview();
  });

  if (window.ResizeObserver) new ResizeObserver(layoutPreview).observe(previewFrame);
  window.addEventListener('resize', layoutPreview);

  /* ---------------- LIVE PREVIEW ---------------- */
  function updatePreview() {
    posterInviteeName.textContent = displayName(state.title, state.customTitle, state.name);
    fitPoster(poster);
  }

  titleSelect.addEventListener('change', () => {
    state.title = titleSelect.value;
    customTitleField.hidden = titleSelect.value !== '__custom';
    updatePreview();
  });
  customTitleInput.addEventListener('input', () => {
    state.customTitle = customTitleInput.value;
    updatePreview();
  });
  nameInput.addEventListener('input', () => {
    state.name = nameInput.value;
    updatePreview();
  });

  /* ---------------- PARTICIPANTS ---------------- */
  const TITLE_OPTIONS = ['', 'Mr & Mrs', 'Mr', 'Mrs', 'Miss', 'Ms', 'Rev', 'Dr', 'Pst', 'Prof', 'HoN', 'HE'];

  manualAddBtn.addEventListener('click', () => {
    const name = manualName.value.trim();
    if (!name) { manualName.focus(); return; }
    addParticipant({ title: manualTitle.value, customTitle: '', name });
    manualName.value = '';
    manualName.focus();
  });
  manualName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') manualAddBtn.click();
  });

  function addParticipant({ title, customTitle, name }) {
    state.participants.push({
      id: nextId++, title: title || '', customTitle: customTitle || '',
      name: name || '', selected: true
    });
    renderParticipants();
  }

  function renderParticipants() {
    participantBody.innerHTML = '';
    emptyListHint.style.display = state.participants.length ? 'none' : 'block';

    state.participants.forEach((p) => {
      const tr = document.createElement('tr');

      const tdSel = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = p.selected;
      cb.setAttribute('aria-label', 'Include ' + p.name);
      cb.addEventListener('change', () => { p.selected = cb.checked; });
      tdSel.appendChild(cb);

      const tdTitle = document.createElement('td');
      const sel = document.createElement('select');
      TITLE_OPTIONS.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t || '—';
        if (t === p.title) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => { p.title = sel.value; });
      tdTitle.appendChild(sel);

      const tdName = document.createElement('td');
      const nameField = document.createElement('input');
      nameField.type = 'text';
      nameField.value = p.name;
      nameField.addEventListener('input', () => { p.name = nameField.value; });
      tdName.appendChild(nameField);

      const tdActions = document.createElement('td');
      tdActions.style.whiteSpace = 'nowrap';
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'row-preview';
      previewBtn.textContent = 'Preview';
      previewBtn.addEventListener('click', () => applyParticipantToPreview(p));

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'row-remove';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + p.name);
      removeBtn.addEventListener('click', () => {
        state.participants = state.participants.filter((x) => x.id !== p.id);
        renderParticipants();
      });

      tdActions.append(previewBtn, removeBtn);
      tr.append(tdSel, tdTitle, tdName, tdActions);
      participantBody.appendChild(tr);
    });
  }

  function applyParticipantToPreview(p) {
    state.title = p.title;
    state.customTitle = p.customTitle || '';
    state.name = p.name;
    titleSelect.value = Array.from(titleSelect.options).some((o) => o.value === p.title) ? p.title : '';
    customTitleField.hidden = true;
    nameInput.value = p.name;
    updatePreview();
    // On phones the preview sits at the top — bring it into view.
    previewFrame.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  selectAllBox.addEventListener('change', () => {
    state.participants.forEach((p) => (p.selected = selectAllBox.checked));
    renderParticipants();
  });

  /* ---------------- FILE IMPORT ---------------- */
  listInput.addEventListener('change', async () => {
    const files = Array.from(listInput.files || []);
    if (!files.length) return;
    importStatus.textContent = 'Reading file(s)…';
    let totalAdded = 0;
    const errors = [];

    for (const file of files) {
      try {
        const names = await extractNamesFromFile(file);
        names.forEach((n) => addParticipant({ title: '', customTitle: '', name: n }));
        totalAdded += names.length;
      } catch (err) {
        console.error(err);
        errors.push(`"${file.name}": ${err.message || err}`);
      }
    }
    importStatus.textContent =
      `Imported ${totalAdded} name(s) from ${files.length} file(s). Review and assign titles below.` +
      (errors.length ? ' Could not read ' + errors.join('; ') : '');
    listInput.value = '';
  });

  async function extractNamesFromFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return extractFromPDF(file);
    if (ext === 'docx') return extractFromDocx(file);
    if (ext === 'doc') throw new Error('legacy .doc is not supported in the browser — please save it as .docx');
    if (ext === 'xls' || ext === 'xlsx') return extractFromSheet(file);
    throw new Error('unsupported file type');
  }

  async function extractFromPDF(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const lines = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach((it) => lines.push(it.str));
    }
    return cleanLines(lines);
  }

  async function extractFromDocx(file) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return cleanLines(result.value.split('\n'));
  }

  async function extractFromSheet(file) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const values = [];
    rows.forEach((row) => {
      if (row && row[0] !== undefined && row[0] !== null) values.push(String(row[0]));
    });
    return cleanLines(values);
  }

  function cleanLines(lines) {
    const skipWords = /^(name|names|participant|participants|invitee|invitees|title|no\.?|#)$/i;
    return lines
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length > 1 && l.length < 60)
      .filter((l) => !skipWords.test(l))
      .filter((l) => /[a-zA-Z]/.test(l));
  }

  /* ---------------- EXPORT (html2canvas → JPG) ----------------
     Always rendered from a fixed 960 × 540 layout at 2.5× (2400 × 1350 px). */
  const RENDER_SCALE = 2.5;

  async function waitForImages(root) {
    const images = Array.from(root.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', () => reject(new Error(`Could not load image: ${img.getAttribute('src')}`)), { once: true });
        });
      })
    );
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function renderPosterBlob() {
    if (typeof html2canvas === 'undefined') throw new Error('html2canvas failed to load. Check your internet connection.');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await waitForImages(poster);
    fitPoster(poster);
    await nextFrame();

    // Clone without the preview scaling so export is always exactly 960 × 540.
    const exportPoster = poster.cloneNode(true);
    exportPoster.removeAttribute('id');
    exportPoster.style.transform = 'none';
    exportPoster.style.position = 'relative';
    exportPoster.style.left = '0';
    exportPoster.style.top = '0';

    const host = document.createElement('div');
    host.style.cssText =
      `position:fixed;left:-10000px;top:0;width:${POSTER_W}px;height:${POSTER_H}px;overflow:hidden;pointer-events:none;z-index:-1;`;
    host.appendChild(exportPoster);
    document.body.appendChild(host);

    try {
      await waitForImages(exportPoster);
      await nextFrame();

      const canvas = await html2canvas(exportPoster, {
        width: POSTER_W,
        height: POSTER_H,
        scale: RENDER_SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: POSTER_W,
        windowHeight: POSTER_H
      });

      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) reject(new Error('Canvas could not be converted to a JPG.'));
          else resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } finally {
      host.remove();
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 1000);
  }

  async function generateBatch(list) {
    if (!list.length) { generateStatus.textContent = 'No participants to generate.'; return; }
    if (typeof JSZip === 'undefined') { generateStatus.textContent = 'JSZip failed to load. Check your internet connection.'; return; }

    generateSelectedBtn.disabled = true;
    generateAllBtn.disabled = true;

    const zip = new JSZip();
    const used = {};
    const saved = { title: state.title, customTitle: state.customTitle, name: state.name };
    let done = 0;

    try {
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        generateStatus.textContent = `Rendering ${i + 1} of ${list.length}: ${p.name}…`;
        state.title = p.title;
        state.customTitle = p.customTitle;
        state.name = p.name;
        updatePreview();
        await nextFrame();
        try {
          const blob = await renderPosterBlob();
          let base = `japhter-medical-aid-${slugify(displayName(p.title, p.customTitle, p.name))}`;
          used[base] = (used[base] || 0) + 1;
          if (used[base] > 1) base += `-${used[base]}`;
          zip.file(`${base}.jpg`, blob);
          done++;
        } catch (err) {
          console.error('Failed for', p.name, err);
        }
      }

      if (!done) throw new Error('No posters could be rendered.');
      generateStatus.textContent = 'Packaging ZIP…';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'japhter-medical-aid-posters.zip');
      generateStatus.textContent = `Done — ${done} poster(s) downloaded as a ZIP.`;
    } catch (err) {
      generateStatus.textContent = `Generation failed: ${err.message || err}`;
    } finally {
      state.title = saved.title;
      state.customTitle = saved.customTitle;
      state.name = saved.name;
      updatePreview();
      generateSelectedBtn.disabled = false;
      generateAllBtn.disabled = false;
    }
  }

  generateSelectedBtn.addEventListener('click', () => generateBatch(state.participants.filter((p) => p.selected)));
  generateAllBtn.addEventListener('click', () => generateBatch(state.participants.slice()));

  downloadCurrentBtn.addEventListener('click', async () => {
    generateStatus.textContent = 'Rendering poster…';
    downloadCurrentBtn.disabled = true;
    try {
      const blob = await renderPosterBlob();
      const label = displayName(state.title, state.customTitle, state.name);
      downloadBlob(blob, `japhter-medical-aid-${slugify(label)}.jpg`);
      generateStatus.textContent = 'Downloaded successfully.';
    } catch (err) {
      console.error('JPG generation failed:', err);
      generateStatus.textContent = `Download failed: ${err.message || err}`;
    } finally {
      downloadCurrentBtn.disabled = false;
    }
  });

  /* ---------------- INIT ---------------- */
  layoutPreview();
  updatePreview();
  renderParticipants();
  // Re-fit once web fonts have loaded (they change text widths).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { updatePreview(); layoutPreview(); });
  }
})();
