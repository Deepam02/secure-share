package handlers

import (
	"context"
	"net/http"
	"os"

	"github.com/redis/go-redis/v9"
)

var Rdb *redis.Client
var ctx = context.Background()

func InitRedis() {
	Rdb = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: os.Getenv("REDIS_PASSWORD"),
	})
}

func TestRedisHandler(w http.ResponseWriter, r *http.Request) {
	err := Rdb.Set(ctx, "hello", "world", 0).Err()
	if err != nil {
		w.Write([]byte("Redis error: " + err.Error()))
		return
	}
	w.Write([]byte("Redis OK"))
}
