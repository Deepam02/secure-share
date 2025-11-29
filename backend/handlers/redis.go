package handlers

import (
	"context"
	"crypto/tls"
	"net/http"
	"os"

	"github.com/redis/go-redis/v9"
)

var Rdb *redis.Client
var ctx = context.Background()

func InitRedis() {
	host := os.Getenv("REDIS_HOST")
	pass := os.Getenv("REDIS_PASSWORD")

	// show in terminal for debugging
	println("REDIS_HOST =", host)
	println("REDIS_PASSWORD =", pass)

	Rdb = redis.NewClient(&redis.Options{
		Addr:     host,
		Password: pass,
		DB:       0,
		TLSConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	})

	// test connection
	_, err := Rdb.Ping(ctx).Result()
	if err != nil {
		println("PING ERROR =", err.Error())
	}
}

func TestRedisHandler(w http.ResponseWriter, r *http.Request) {
	_, err := Rdb.Ping(ctx).Result()
	if err != nil {
		w.Write([]byte("Ping error: " + err.Error()))
		return
	}
	w.Write([]byte("Redis connected OK"))
}
