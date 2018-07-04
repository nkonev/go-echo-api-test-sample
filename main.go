package main

import (
	"github.com/labstack/echo"
	"github.com/go-echo-api-test-sample/handlers"
	"github.com/go-echo-api-test-sample/models"
	"github.com/go-echo-api-test-sample/db"
	"github.com/go-echo-api-test-sample/migrations"
	"os"
	"github.com/labstack/gommon/log"
	"os/signal"
	"context"
	"time"
	"github.com/labstack/echo/middleware"
	"github.com/nkonev/authboss"
	"github.com/nkonev/authboss/defaults"
	_ "github.com/nkonev/authboss/auth"
	"net/http"
)

func configureEcho() *echo.Echo {
	log.SetOutput(os.Stdout)

	authPathPrefix := "/auth2"

	ab := authboss.New()
	ab.Config.Core.ViewRenderer = defaults.JSONRenderer{}
	defaults.SetCore(&ab.Config, true, true)
	if err := ab.Init("auth"); err != nil {
		log.Panic(err)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Secure())
	e.Use(middleware.BodyLimit("2M"))

	d0 := db.DBConnect()
	migrations.MigrateX(d0)
	d1 := db.DBConnect()
	h := users.NewHandler(user.NewUserModel(d1))

	e.GET("/users", h.GetIndex)
	e.GET("/users/:id", h.GetDetail)

	g := e.Group(authPathPrefix)
	g.Use(wrap(http.StripPrefix(authPathPrefix, ab.Config.Core.Router)))


	return e
}

func wrap(h http.Handler) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			h.ServeHTTP(c.Response(), c.Request())
			return next(c)
		}
	}
}


func main() {
	e := configureEcho()

	log.Info("Starting server")
	// Start server
	go func() {
		if err := e.Start(":1234"); err != nil {
			log.Infof("shutting down the server due error %v", err)
		}
	}()

	log.Info("Waiting for interrupt (2) (Ctrl+C)")
	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 10 seconds.
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Infof("Got signal %v", os.Interrupt)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}
