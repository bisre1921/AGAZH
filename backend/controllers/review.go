package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func CreateReview(c *gin.Context) {
	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review.CreatedAt = time.Now()

	session, err := config.DB.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session"})
		return
	}
	defer session.EndSession(context.Background())

	err = session.StartTransaction()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	result, err := config.DB.Collection("reviews").InsertOne(context.Background(), review)
	if err != nil {
		session.AbortTransaction(context.Background())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	pipeline := []bson.M{
		{"$match": bson.M{"housekeeper_id": review.HousekeeperID}},
		{"$group": bson.M{
			"_id":            nil,
			"average_rating": bson.M{"$avg": "$rating"},
		}},
	}

	cursor, err := config.DB.Collection("reviews").Aggregate(context.Background(), pipeline)
	if err != nil {
		session.AbortTransaction(context.Background())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate average rating"})
		return
	}

	var results []bson.M
	if err = cursor.All(context.Background(), &results); err != nil {
		session.AbortTransaction(context.Background())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process average rating"})
		return
	}

	if len(results) > 0 {
		averageRating := results[0]["averageRating"].(float64)
		_, err = config.DB.Collection("housekeepers").UpdateOne(context.Background(), bson.M{"_id": review.HousekeeperID}, bson.M{"$set": bson.M{"rating": averageRating}})
		if err != nil {
			session.AbortTransaction(context.Background())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update housekeeper rating"})
			return
		}

	}

	if err = session.CommitTransaction(context.Background()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}
