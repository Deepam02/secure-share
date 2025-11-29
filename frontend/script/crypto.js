async function deriveKey(password, salt) {
  let enc = new TextEncoder().encode(password)
  let keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  )

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt, // Dynamic salt
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

async function encryptFile(file, key, iv) {
  let data = await file.arrayBuffer()
  return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data)
}

async function decryptData(encrypted, key, iv64) {
  let iv = Uint8Array.from(atob(iv64), c => c.charCodeAt(0))
  if (iv.length !== 12) throw new Error("Invalid IV length"); // Validate IV
  return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16)); // Generate 16-byte salt
}
