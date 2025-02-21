package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateReview godoc
// @Summary Creates a new review for a housekeeper
// @Description This endpoint creates a new review for a specific housekeeper
// @Tags review
// @Accept json
// @Produce json
// @Param review body models.Review true "Review data"
// @Success 201 {object} models.ReviewResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /create-review [post]
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
			"_id":           nil,
			"averageRating": bson.M{"$avg": "$rating"},
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

// GetHousekeeperReviews godoc
// @Summary Fetches all reviews for a specific housekeeper
// @Description This endpoint retrieves all reviews associated with a specific housekeeper based on their ID
// @Tags review
// @Accept json
// @Produce json
// @Param id path string true "Housekeeper ID"
// @Success 200 {object} models.ReviewsResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /housekeeper/{id}/reviews [get]
func GetHousekeeperReviews(c *gin.Context) {
	housekeeperID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid housekeeper ID"})
		return
	}

	cursor, err := config.DB.Collection("reviews").Find(
		context.Background(),
		bson.M{"housekeeper_id": housekeeperID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}
	defer cursor.Close(context.Background())

	var reviews []models.Review
	if err = cursor.All(context.Background(), &reviews); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}
