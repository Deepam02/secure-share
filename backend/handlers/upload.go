package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type UploadMeta struct {
	Files []MetaFile `json:"files"`
}

type MetaFile struct {
	Name string `json:"name"`
	Size int64  `json:"size"` // original size in bytes
	IV   string `json:"iv"`   // base64 iv for this file
}

type UploadResponse struct {
	ID string `json:"id"`
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(200 << 20) // 200MB total
	if err != nil {
		http.Error(w, "could not parse multipart form", http.StatusBadRequest)
		return
	}

	metaStr := r.FormValue("meta")
	if metaStr == "" {
		http.Error(w, "missing meta field", http.StatusBadRequest)
		return
	}

	var meta UploadMeta
	err = json.Unmarshal([]byte(metaStr), &meta)
	if err != nil {
		http.Error(w, "invalid meta json", http.StatusBadRequest)
		return
	}

	id := fmt.Sprintf("%d", time.Now().UnixNano())
	basePath := "uploads/" + id
	err = os.MkdirAll(basePath, 0755)
	if err != nil {
		http.Error(w, "could not create folder", http.StatusInternalServerError)
		return
	}

	// save all file parts (encrypted bytes)
	files := r.MultipartForm.File["file"]
	for _, hdr := range files {
		f, err := hdr.Open()
		if err != nil {
			continue
		}
		defer f.Close()

		out, err := os.Create(basePath + "/" + hdr.Filename)
		if err != nil {
			continue
		}
		io.Copy(out, f)
		out.Close()
	}

	// store the meta JSON string in Redis with 24h ttl
	key := "meta:" + id
	err = Rdb.Set(ctx, key, metaStr, 24*time.Hour).Err()
	if err != nil {
		http.Error(w, "could not store metadata", http.StatusInternalServerError)
		return
	}

	resp := UploadResponse{ID: id}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
