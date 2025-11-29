package handlers

import "net/http"

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("download route working"))
}
