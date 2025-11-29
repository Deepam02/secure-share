let currentMeta = null;
let currentId = null;

async function loadFiles() {
  let params = new URLSearchParams(window.location.search);
  currentId = params.get("id");

  if (!currentId) {
    document.body.innerHTML = "<div class='container'><div class='glass-card'><h1>Error</h1><p>Invalid link</p></div></div>";
    throw new Error("Invalid ID");
  }

  // Show loading state
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) subtitle.textContent = 'Loading...';

  try {
    // Fetch metadata first to verify existence
    currentMeta = await apiGetMeta(currentId);
    if (subtitle) subtitle.textContent = 'Enter password to unlock files';
  } catch (e) {
    console.error(e);
    if (subtitle) subtitle.textContent = e.message || 'Error loading files';
    showToast(e.message || 'Error loading files', 'error');
    throw e;
  }
}

async function handleUnlock() {
  const password = document.getElementById('password').value;
  if (!password) {
    showToast('Please enter a password', 'error');
    return;
  }

  setLoading('unlock-btn', true, 'Unlocking...');

  try {
    // Derive key
    const salt = Uint8Array.from(atob(currentMeta.salt), c => c.charCodeAt(0));
    const key = await deriveKey(password, salt);

    window.decryptionKey = key;

    renderFileList(currentMeta.files);

    document.getElementById('auth-form').classList.add('hidden');
    document.getElementById('file-view').classList.remove('hidden');

    // Update subtitle with count
    const count = currentMeta.files.length;
    document.querySelector('.subtitle').textContent = `${count} file${count !== 1 ? 's' : ''} unlocked`;

    showToast('Files unlocked', 'success');

  } catch (e) {
    console.error(e);
    showToast('Failed to unlock. Check password.', 'error');
  } finally {
    setLoading('unlock-btn', false);
  }
}

function renderFileList(files) {
  const list = document.getElementById('files-list');
  list.innerHTML = '';

  files.forEach(f => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <span style="font-size:1.2rem">📄</span>
                <div style="overflow:hidden;">
                    <div class="name" title="${f.name}">${f.name}</div>
                    <div class="size">${formatBytes(f.size)}</div>
                </div>
            </div>
            <button class="btn btn-primary" style="width:auto; padding: 6px 12px; font-size:0.8rem;" 
                onclick="downloadFile('${f.name}', '${f.iv}')">Download</button>
        `;
    list.appendChild(item);
  });
}

async function downloadFile(filename, ivBase64) {
  try {
    showToast(`Downloading ${filename}...`);
    const encrypted = await apiGetFile(currentId, filename);
    // Pass base64 IV directly as decryptData expects it
    const decrypted = await decryptData(encrypted, window.decryptionKey, ivBase64);

    const blob = new Blob([decrypted]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  } catch (e) {
    console.error(e);
    showToast('Decryption failed. Wrong password?', 'error');
  }
}

async function downloadAll() {
  try {
    showToast('Preparing ZIP download...');
    const zip = new JSZip();

    for (let f of currentMeta.files) {
      const encrypted = await apiGetFile(currentId, f.name);
      // Pass base64 IV directly
      const decrypted = await decryptData(encrypted, window.decryptionKey, f.iv);
      zip.file(f.name, decrypted);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "files.zip";
    a.click();
    showToast('ZIP Download started', 'success');
  } catch (e) {
    console.error(e);
    showToast('Download failed. Wrong password?', 'error');
  }
}

// Expose functions to window
window.loadFiles = loadFiles;
window.handleUnlock = handleUnlock;
window.downloadAll = downloadAll;
window.downloadFile = downloadFile;

// Start loading metadata immediately
loadFiles().catch(e => console.error(e));
