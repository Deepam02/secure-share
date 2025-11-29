async function apiUpload(formData) {
  try {
    const res = await fetch(BACKEND_URL + "/upload", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("API Upload Error:", error);
    alert("Failed to upload files. Please try again.");
  }
}

async function apiGetMeta(id) {
  try {
    const res = await fetch(BACKEND_URL + `/meta/${id}`);
    if (!res.ok) throw new Error(`Get Meta failed: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("API Get Meta Error:", error);
    alert("Failed to fetch file metadata. Please try again.");
  }
}

async function apiGetFile(id, filename) {
  try {
    const res = await fetch(BACKEND_URL + `/file/${id}/${filename}`);
    if (!res.ok) throw new Error(`Get File failed: ${res.statusText}`);
    return res.arrayBuffer();
  } catch (error) {
    console.error("API Get File Error:", error);
    alert("Failed to download file. Please try again.");
  }
}
