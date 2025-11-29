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
	user := os.Getenv("REDIS_USER") // new

	println("Redis host =", host)
	println("Redis user =", user)
	println("Redis pass =", pass)

	Rdb = redis.NewClient(&redis.Options{
		Addr:     host,
		Username: user, // ADD THIS
		Password: pass,
		DB:       0,
		TLSConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	})

	_, err := Rdb.Ping(ctx).Result()
	if err != nil {
		println("PING ERROR =", err.Error())
	} else {
		println("PING SUCCESS")
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
