package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetEmployer godoc
// @Summary Retrieves details of a specific employer
// @Description This endpoint retrieves an employer's details by their ID
// @Tags employer
// @Accept json
// @Produce json
// @Param id path string true "Employer ID"
// @Success 200 {object} models.Employer
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /employer/{id} [get]
func GetEmployer(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employer ID"})
		return
	}

	var employer models.Employer
	err = config.DB.Collection("employers").FindOne(context.Background(), bson.M{"_id": id}).Decode(&employer)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Housekeeper not found"})
		return
	}

	c.JSON(http.StatusOK, employer)
}

// UpdateEmployer godoc
// @Summary Updates an employer's details
// @Description This endpoint allows updating the details of a specific employer
// @Tags employer
// @Accept json
// @Produce json
// @Param id path string true "Employer ID"
// @Param updates body models.EmployerUpdate true "Updated employer data"
// @Success 200 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /employer/{id} [put]
func UpdateEmployer(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employer ID"})
		return
	}

	var updates models.Employer
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return // Important: Return after error
	}

	// Construct the update document using $set
	update := bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "name", Value: updates.Name},
			{Key: "address", Value: updates.Address},
			{Key: "phone_number", Value: updates.PhoneNumber},
			{Key: "family_size", Value: updates.FamilySize},
			// Add other fields you want to update
		}},
	}

	result, err := config.DB.Collection("employers").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating employer"})
		return // Important: Return after error
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employer not found"})
		return // Important: Return after error
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employer updated successfully"})
}
