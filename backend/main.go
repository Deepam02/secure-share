package main

import (
	"log"
	"net/http"
	"secure-share/handlers"
)

func withCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// allow your Vercel domain here in production
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		h(w, r)
	}
}

func main() {
	handlers.InitRedis()

	http.HandleFunc("/upload", withCORS(handlers.UploadHandler))
	http.HandleFunc("/meta/", withCORS(handlers.MetaHandler))
	http.HandleFunc("/file/", withCORS(handlers.FileHandler))

	log.Println("Server running on port 10000")
	http.ListenAndServe(":10000", nil)
}
