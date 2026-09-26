(function () {
  'use strict';

  if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const state = {
    title: '',
    customTitle: '',
    name: '',
    photo: { scale: 100, x: 50, y: 50 },
    mpesa: { size: 120 },
    participants: [] // { id, title, customTitle, name, selected }
  };
  let nextId = 1;

  /* ---------------------------------------------------------
     DOM REFS
  --------------------------------------------------------- */
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
  const posterPhoto = $('posterPhoto');
  const posterPhotoPlaceholder = $('posterPhotoPlaceholder');
  const posterInviteeName = $('posterInviteeName');
  const posterMpesaWrap = $('posterMpesaWrap');
  const posterMpesa = $('posterMpesa');

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  function displayName(title, custom, name) {
    const t = title === '__custom' ? (custom || '').trim() : (title || '').trim();
    const n = (name || '').trim();
    if (!n) return 'Esteemed Guest';
    return t ? `${t}. ${n}`.replace(/\.\.$/, '.') : n;
  }

  function slugify(text) {
    return (text || 'invitation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'invitation';
  }

  /* ---------------------------------------------------------
     LIVE PREVIEW UPDATE
  --------------------------------------------------------- */
  function updatePreview() {
  const label = displayName(
    state.title,
    state.customTitle,
    state.name
  );

  posterInviteeName.textContent = label;

  // Japhter's fixed image
  posterPhoto.style.opacity = '1';
  posterPhoto.style.objectPosition =
    `${state.photo.x}% ${state.photo.y}%`;
  posterPhoto.style.transform =
    `scale(${state.photo.scale / 100})`;

  // Fixed M-PESA icon
  posterMpesa.style.width = '120px';
  posterMpesa.style.height = '120px';
}

  /* ---------------------------------------------------------
     INVITEE CONTROLS
  --------------------------------------------------------- */
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


  /* ---------------------------------------------------------
     PARTICIPANT LIST — manual add
  --------------------------------------------------------- */
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
      id: nextId++,
      title: title || '',
      customTitle: customTitle || '',
      name: name || '',
      selected: true
    });
    renderParticipants();
  }

  function renderParticipants() {
    participantBody.innerHTML = '';
    emptyListHint.style.display = state.participants.length ? 'none' : 'block';

    const titleOptions = ['', 'Mr & Mrs', 'Mr', 'Mrs', 'Miss', 'Ms', 'Rev', 'Dr', 'Pst', 'Prof', 'HoN', 'HE'];

    state.participants.forEach((p) => {
      const tr = document.createElement('tr');

      const tdSel = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = p.selected;
      cb.addEventListener('change', () => { p.selected = cb.checked; });
      tdSel.appendChild(cb);

      const tdTitle = document.createElement('td');
      const sel = document.createElement('select');
      titleOptions.forEach((t) => {
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
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'row-preview';
      previewBtn.textContent = 'Preview';
      previewBtn.addEventListener('click', () => applyParticipantToPreview(p));
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'row-remove';
      removeBtn.innerHTML = '✕';
      removeBtn.title = 'Remove';
      removeBtn.addEventListener('click', () => {
        state.participants = state.participants.filter((x) => x.id !== p.id);
        renderParticipants();
      });
      tdActions.appendChild(previewBtn);
      tdActions.appendChild(removeBtn);

      tr.appendChild(tdSel);
      tr.appendChild(tdTitle);
      tr.appendChild(tdName);
      tr.appendChild(tdActions);
      participantBody.appendChild(tr);
    });
  }

  function applyParticipantToPreview(p) {
    state.title = p.title === '__custom' ? '__custom' : p.title;
    state.customTitle = p.customTitle || '';
    state.name = p.name;
    titleSelect.value = titleOptionExists(p.title) ? p.title : '';
    nameInput.value = p.name;
    updatePreview();
  }
  function titleOptionExists(t) {
    return Array.from(titleSelect.options).some((o) => o.value === t);
  }

  selectAllBox.addEventListener('change', () => {
    state.participants.forEach((p) => (p.selected = selectAllBox.checked));
    renderParticipants();
  });

  /* ---------------------------------------------------------
     PARTICIPANT LIST — file import
  --------------------------------------------------------- */
  listInput.addEventListener('change', async () => {
    const files = Array.from(listInput.files || []);
    if (!files.length) return;
    importStatus.textContent = 'Reading file(s)…';
    let totalAdded = 0;

    for (const file of files) {
      try {
        const names = await extractNamesFromFile(file);
        names.forEach((n) => addParticipant({ title: '', customTitle: '', name: n }));
        totalAdded += names.length;
      } catch (err) {
        console.error(err);
        importStatus.textContent = `Could not read "${file.name}": ${err.message || err}`;
      }
    }
    importStatus.textContent = `Imported ${totalAdded} name(s) from ${files.length} file(s). Review and assign titles below.`;
    listInput.value = '';
  });

  async function extractNamesFromFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') return extractFromPDF(file);
    if (ext === 'docx') return extractFromDocx(file);
    if (ext === 'doc') throw new Error('legacy .doc is not supported in-browser — please save as .docx');
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
      const text = content.items.map((it) => it.str).join('\n');
      text.split('\n').forEach((l) => lines.push(l));
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

  /* ---------------------------------------------------------
     GENERATION (html2canvas → JPG)
  --------------------------------------------------------- */
  const RENDER_SCALE = 2.5; // ~2400x1350 for a 960x540 poster box

 async function renderPosterBlob() {
  // Make sure all images inside the poster are fully loaded
  const images = Array.from(poster.querySelectorAll('img'));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener(
          'error',
          () => reject(new Error(`Could not load image: ${img.src}`)),
          { once: true }
        );
      });
    })
  );

  // Give the browser one frame to finish layout/painting
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

  const canvas = await html2canvas(poster, {
    scale: RENDER_SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#FFFFFF',
    logging: false
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas could not be converted to a JPG.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}
  function downloadBlob(blob, filename) {
  if (!blob) {
    throw new Error('No file data was generated.');
  }

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

  downloadCurrentBtn.addEventListener('click', async () => {
    generateStatus.textContent = 'Rendering poster…';
    downloadCurrentBtn.disabled = true;
    try {
      const blob = await renderPosterBlob();
      const label = displayName(state.title, state.customTitle, state.name);
      downloadBlob(blob, `japhter-medical-aid-${slugify(label)}.jpg`);
      generateStatus.textContent = 'Downloaded.';
    } catch (err) {
      console.error(err);
      generateStatus.textContent = 'Could not render the poster. See console for details.';
    } finally {
      downloadCurrentBtn.disabled = false;
    }
  });

  async function generateBatch(list) {
    if (!list.length) {
      generateStatus.textContent = 'No participants to generate.';
      return;
    }
    generateSelectedBtn.disabled = true;
    generateAllBtn.disabled = true;

    if (typeof JSZip === 'undefined') {
  throw new Error('JSZip failed to load.');
}

const zip = new JSZip();
    const savedTitle = state.title, savedCustom = state.customTitle, savedName = state.name;

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      generateStatus.textContent = `Rendering ${i + 1} of ${list.length}: ${p.name}…`;
      state.title = p.title;
      state.customTitle = p.customTitle;
      state.name = p.name;
      updatePreview();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      try {
        const blob = await renderPosterBlob();
        const label = displayName(p.title, p.customTitle, p.name);
        zip.file(`japhter-medical-aid-${slugify(label)}.jpg`, blob);
      } catch (err) {
        console.error('Failed for', p.name, err);
      }
    }

    state.title = savedTitle; state.customTitle = savedCustom; state.name = savedName;
    updatePreview();

    generateStatus.textContent = 'Packaging ZIP…';
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'japhter-medical-aid-posters.zip');
    generateStatus.textContent = `Done — ${list.length} poster(s) downloaded as a ZIP.`;

    generateSelectedBtn.disabled = false;
    generateAllBtn.disabled = false;
  }

  generateSelectedBtn.addEventListener('click', () => {
    generateBatch(state.participants.filter((p) => p.selected));
  });
  generateAllBtn.addEventListener('click', () => {
    generateBatch(state.participants.slice());
  });

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  updatePreview();
  renderParticipants();
})();

downloadCurrentBtn.addEventListener('click', async () => {
  generateStatus.textContent = 'Rendering poster…';
  downloadCurrentBtn.disabled = true;

  try {
    const blob = await renderPosterBlob();

    const label = displayName(
      state.title,
      state.customTitle,
      state.name
    );

    const filename =
      `japhter-medical-aid-${slugify(label)}.jpg`;

    downloadBlob(blob, filename);

    generateStatus.textContent = 'Downloaded successfully.';
  } catch (err) {
    console.error('JPG generation failed:', err);

    generateStatus.textContent =
      `Download failed: ${err.message || err}`;
  } finally {
    downloadCurrentBtn.disabled = false;
  }
});
