package main

import (
	"log"
	"net/http"
	"secure-share/handlers"
)

func main() {
	handlers.InitRedis()

	http.HandleFunc("/upload", handlers.UploadHandler)
	http.HandleFunc("/get-files/", handlers.GetFilesHandler)
	http.HandleFunc("/download/", handlers.DownloadSpecificHandler)
	http.HandleFunc("/download-zip/", handlers.DownloadZipHandler)

	log.Println("Server running on port 10000")
	http.ListenAndServe(":10000", nil)
}
