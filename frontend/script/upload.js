async function uploadFiles() {
  let files = document.getElementById('files').files
  let password = document.getElementById('password').value

  if (!files.length) {
    showToast('Please select at least one file', 'error');
    throw new Error('No files selected');
  }
  if (!password) {
    showToast('Please enter a password', 'error');
    throw new Error('No password entered');
  }

  let salt = generateSalt()
  let key = await deriveKey(password, salt)
  let meta = { files: [], salt: btoa(String.fromCharCode(...salt)) }
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
  if (!data) throw new Error('Upload failed');

  // Show result
  document.getElementById('upload-form').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');

  const linkInput = document.getElementById('link');
  linkInput.value = `${FRONTEND_URL}/view.html?id=${data.id}`;

  showToast('Files uploaded successfully!', 'success');
}

function copyLink() {
  let input = document.getElementById("link")
  input.select()
  document.execCommand("copy")
  showToast('Link copied to clipboard', 'success');
}
