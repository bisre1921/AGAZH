package main

import (
	"backend/config"
	"backend/routes"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title AGAZH API
// @version 1.0
// @description This is the API for the AGAZH project.
// @BasePath /api/v1
// @host localhost:8080
func main() {
	if err := config.ConnectDB(); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		// AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	v1 := r.Group("/api/v1")
	{
		routes.SetupAuthRoutes(v1)
		routes.SetupHousekeeperRoutes(v1)
		routes.SetupEmployerRoutes(v1)
		routes.SetupHiringRoutes(v1)
		routes.SetupRatingRoutes(v1)
	}

	r.Static("/docs", "./docs")

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.URL("/docs/swagger.json")))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server Run Failed:", err)
	}
}
