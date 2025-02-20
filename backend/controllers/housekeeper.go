package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetHousekeepers(c *gin.Context) {
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

func GetHousekeeper(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid housekeeper ID"})
		return
	}

	var housekeeper models.Housekeeper
	err = config.DB.Collection("housekeepers").FindOne(context.Background(), bson.M{"_id": id}).Decode(&housekeeper)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Housekeeper not found"})
		return
	}

	c.JSON(http.StatusOK, housekeeper)
}
