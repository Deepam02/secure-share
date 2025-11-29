package handlers

import (
	"net/http"
	"strings"
)

func MetaHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/meta/")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	key := "meta:" + id
	metaStr, err := Rdb.Get(ctx, key).Result()
	if err != nil {
		http.Error(w, "not found or expired", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(metaStr))
}
