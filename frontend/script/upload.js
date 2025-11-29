async function uploadFiles() {
  let files = document.getElementById('files').files
  let password = document.getElementById('password').value
  let result = document.getElementById('result')

  if (!files.length) return alert('choose files')
  if (!password) return alert('enter password')

  let salt = generateSalt()
  let key = await deriveKey(password, salt)
  let meta = { files: [], salt: btoa(String.fromCharCode(...salt)) } // Include salt in metadata
  let formData = new FormData()

  for (let f of files) {
    let iv = crypto.getRandomValues(new Uint8Array(12))
    let enc = await encryptFile(f, key, iv)
    formData.append("file", new Blob([enc]), f.name)

    meta.files.push({
      name: f.name,
      size: f.size,
      iv: btoa(String.fromCharCode(...iv))
    })
  }

  formData.append("meta", JSON.stringify(meta))
  let data = await apiUpload(formData)

  result.innerHTML = `
     <p>Link is ready:</p>
     <input id="link" style="width:80%" value="${FRONTEND_URL}/view.html?id=${data.id}" readonly>
     <button onclick="copyLink()">Copy</button>
  `
}

function copyLink() {
  let input = document.getElementById("link")
  input.select()
  document.execCommand("copy")
  alert("Copied")
}
