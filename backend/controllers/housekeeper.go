package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetHouseKeepers(c *gin.Context) {
	var filter bson.M = bson.M{}

	if category := c.Query("category"); category != "" {
		filter["category"] = category
	}
	if empType := c.Query("employment_type"); empType != "" {
		filter["employment_type"] = empType
	}
	if location := c.Query("location"); location != "" {
		filter["location"] = location
	}

	filter["is_available"] = true

	opts := options.Find().SetSort(bson.D{{Key: "rating", Value: -1}})

	cursor, err := config.DB.Collection("housekeepers").Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching housekeepers"})
		return
	}
	defer cursor.Close(context.Background())

	var housekeepers []models.Housekeeper
	if err = cursor.All(context.Background(), &housekeepers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while decoding housekeepers"})
		return
	}

	c.JSON(http.StatusOK, housekeepers)
}
