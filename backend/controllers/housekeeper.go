package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"log" // Import the log package
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetHousekeepers godoc
// @Summary Retrieves a list of housekeepers based on filter criteria
// @Description This endpoint fetches housekeepers based on category, employment type, and location filters
// @Tags housekeeper
// @Accept json
// @Produce json
// @Param category query string false "Category (NORMAL, CHILD_CARE, CLEANING)"
// @Param employment_type query string false "Employment Type (LIVE_OUT, LIVE_IN)"
// @Param location query string false "Location"
// @Success 200 {array} models.Housekeeper
// @Failure 500 {object} models.ErrorResponse
// @Router /housekeepers [get]
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

// GetHousekeeper godoc
// @Summary Retrieves details of a specific housekeeper
// @Description This endpoint retrieves a housekeeper's details by their ID
// @Tags housekeeper
// @Accept json
// @Produce json
// @Param id path string true "Housekeeper ID"
// @Success 200 {object} models.Housekeeper
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /housekeeper/{id} [get]
func GetHousekeeper(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid housekeeper ID"})
		return
	}

	var housekeeper models.Housekeeper
	err = config.DB.Collection("housekeepers").FindOne(context.Background(), bson.M{"_id": id}).Decode(&housekeeper)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Housekeeper not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching housekeeper"})
		}
		return
	}

	c.JSON(http.StatusOK, housekeeper)
}

// UpdateHousekeeper godoc
// @Summary Updates a housekeeper's details
// @Description This endpoint allows updating the details of a specific housekeeper
// @Tags housekeeper
// @Accept json
// @Produce json
// @Param id path string true "Housekeeper ID"
// @Param updates body models.HousekeeperUpdate true "Updated housekeeper data"
// @Success 200 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /housekeeper/{id} [put]
func UpdateHousekeeper(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid housekeeper ID"})
		return
	}

	var updates models.HousekeeperUpdate // Use HousekeeperUpdate
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Construct the update document.  Only include fields that are present
	updateDoc := bson.D{}
	setDoc := bson.D{}

	if updates.Name != "" {
		setDoc = append(setDoc, bson.E{Key: "name", Value: updates.Name})
	}
	if updates.Age != 0 {
		setDoc = append(setDoc, bson.E{Key: "age", Value: updates.Age})
	}
	if updates.Experience != 0 {
		setDoc = append(setDoc, bson.E{Key: "experience", Value: updates.Experience})
	}
	if updates.Category != "" {
		setDoc = append(setDoc, bson.E{Key: "category", Value: updates.Category})
	}
	if updates.EmploymentType != "" {
		setDoc = append(setDoc, bson.E{Key: "employment_type", Value: updates.EmploymentType})
	}
	if updates.Location != "" {
		setDoc = append(setDoc, bson.E{Key: "location", Value: updates.Location})
	}
	if updates.PhoneNumber != "" {
		setDoc = append(setDoc, bson.E{Key: "phone_number", Value: updates.PhoneNumber})
	}
	if updates.Skills != nil {
		setDoc = append(setDoc, bson.E{Key: "skills", Value: updates.Skills})
	}
	if updates.PhotoURL != "" {
		setDoc = append(setDoc, bson.E{Key: "photo_url", Value: updates.PhotoURL})
	}
	if updates.Certifications != nil {
		setDoc = append(setDoc, bson.E{Key: "certifications", Value: updates.Certifications})
	}
	if updates.Religion != "" {
		setDoc = append(setDoc, bson.E{Key: "religion", Value: updates.Religion})
	}
	if updates.PlaceOfBirth != "" {
		setDoc = append(setDoc, bson.E{Key: "place_of_birth", Value: updates.PlaceOfBirth})
	}

	if len(setDoc) > 0 {
		updateDoc = append(updateDoc, bson.E{Key: "$set", Value: setDoc})
	}

	result, err := config.DB.Collection("housekeepers").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		updateDoc,
	)
	if err != nil {
		log.Printf("Error updating housekeeper: %v", err) // Log the error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating housekeeper"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Housekeeper not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Housekeeper updated successfully"})
}

// DeleteHousekeeper godoc
// @Summary Deletes a housekeeper's record
// @Description This endpoint deletes a specific housekeeper's record
// @Tags housekeeper
// @Accept json
// @Produce json
// @Param id path string true "Housekeeper ID"
// @Success 200 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /housekeeper/{id} [delete]
func DeleteHousekeeper(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid housekeeper ID"})
		return
	}

	result, err := config.DB.Collection("housekeepers").DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting housekeeper"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Housekeeper not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Housekeeper deleted successfully"})
}
