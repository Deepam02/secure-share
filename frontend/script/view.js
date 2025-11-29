async function loadFiles() {
  let params = new URLSearchParams(window.location.search)
  let id = params.get("id")
  if (!id) return document.body.innerHTML = "Invalid link"

  let filesMeta = await apiGetMeta(id)
  let salt = Uint8Array.from(atob(filesMeta.salt), c => c.charCodeAt(0)) // Decode salt
  let html = ""

  for (let f of filesMeta.files) {
    html += `
      <p>${f.name} (${f.size})
        <button onclick="downloadFile('${id}','${f.name}','${f.iv}', '${btoa(String.fromCharCode(...salt))}')">Download</button>
      </p>
    `
  }

  html += `<button onclick="downloadAll('${id}', '${btoa(String.fromCharCode(...salt))}')">Download All as ZIP</button>`
  document.getElementById("filesList").innerHTML = html
}

async function downloadFile(id, name, iv, salt64) {
  let password = prompt("Enter password")
  if (!password) return

  let encrypted = await apiGetFile(id, name)
  let salt = Uint8Array.from(atob(salt64), c => c.charCodeAt(0))
  let key = await deriveKey(password, salt)
  let decrypted = await decryptData(encrypted, key, iv)

  let blob = new Blob([decrypted])
  let a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
}

async function downloadAll(id, salt64) {
  let password = prompt("Enter password")
  if (!password) return

  let filesMeta = await apiGetMeta(id)
  let salt = Uint8Array.from(atob(salt64), c => c.charCodeAt(0))
  let key = await deriveKey(password, salt)
  let zip = new JSZip()

  for (let f of filesMeta.files) {
    let encrypted = await apiGetFile(id, f.name)
    let decrypted = await decryptData(encrypted, key, f.iv)
    zip.file(f.name, decrypted)
  }

  let blob = await zip.generateAsync({ type: "blob" })
  let a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "files.zip"
  a.click()
}

loadFiles()
