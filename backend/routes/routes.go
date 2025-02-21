package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/register/housekeeper", controllers.RegisterHouseKeeper)
		auth.POST("/register/employer", controllers.RegisterEmployer)
		auth.POST("/login", controllers.Login)
	}
}

func SetupHousekeeperRoutes(router *gin.RouterGroup) {
	housekeepers := router.Group("/housekeepers")
	housekeepers.Use(middleware.AuthMiddleware())
	{
		housekeepers.GET("", controllers.GetHousekeepers)
		housekeepers.GET("/:id", controllers.GetHousekeeper)
		housekeepers.PUT("/:id", controllers.UpdateHousekeeper)
		housekeepers.DELETE("/:id", controllers.DeleteHousekeeper)
	}
}

func SetupEmployerRoutes(router *gin.RouterGroup) {
	employers := router.Group("/employers")
	employers.Use(middleware.AuthMiddleware())
	{
		// to do later
	}
}

func SetupHiringRoutes(router *gin.RouterGroup) {
	hiring := router.Group("/hiring")
	hiring.Use(middleware.AuthMiddleware())
	{
		hiring.POST("", controllers.CreateHiring)
		hiring.GET("/:id", controllers.GetHiringStatus)
	}
}

func SetupRatingRoutes(router *gin.RouterGroup) {
	ratings := router.Group("/ratings")
	ratings.Use(middleware.AuthMiddleware())
	{
		ratings.POST("", controllers.CreateReview)
		ratings.GET("/housekeeper/:id", controllers.GetHousekeeperReviews)
	}
}
