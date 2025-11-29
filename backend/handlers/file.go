package handlers

import (
	"net/http"
	"path"
	"strings"
)

func FileHandler(w http.ResponseWriter, r *http.Request) {
	// /file/<id>/<filename>
	rest := strings.TrimPrefix(r.URL.Path, "/file/")
	parts := strings.SplitN(rest, "/", 2)
	if len(parts) != 2 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}

	id := parts[0]
	name := path.Base(parts[1]) // simple protection against ../

	filePath := "uploads/" + id + "/" + name
	http.ServeFile(w, r, filePath)
}
