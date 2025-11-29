let currentMeta = null;
let currentId = null;

async function loadFiles() {
  let params = new URLSearchParams(window.location.search);
  currentId = params.get("id");

  if (!currentId) {
    document.body.innerHTML = "<div class='container'><div class='glass-card'><h1>Error</h1><p>Invalid link</p></div></div>";
    throw new Error("Invalid ID");
  }

  // Let's expose loadFiles and call it on load.

  window.loadFiles = loadFiles;
  window.handleUnlock = handleUnlock;
  window.downloadAll = downloadAll;
  window.downloadFile = downloadFile;

  // Start loading metadata immediately
  loadFiles().catch(e => console.error(e));
