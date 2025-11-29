async function apiUpload(formData) {
  const res = await fetch(BACKEND_URL + "/upload", {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

async function apiGetMeta(id) {
  const res = await fetch(BACKEND_URL + `/meta/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Link expired or invalid");
    throw new Error(`Get Meta failed: ${res.statusText}`);
  }
  return res.json();
}

async function apiGetFile(id, filename) {
  const res = await fetch(BACKEND_URL + `/file/${id}/${filename}`);
  if (!res.ok) throw new Error(`Get File failed: ${res.statusText}`);
  return res.arrayBuffer();
}
