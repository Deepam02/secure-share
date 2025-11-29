package main

import (
	"log"
	"net/http"
	"secure-share/handlers"
)

func main() {
	handlers.InitRedis() // connect to Redis

	http.HandleFunc("/upload", handlers.UploadHandler)
	http.HandleFunc("/download/", handlers.DownloadHandler)
	http.HandleFunc("/test", handlers.TestRedisHandler)

	log.Println("Server starting on port 10000")
	http.ListenAndServe(":10000", nil)
}
