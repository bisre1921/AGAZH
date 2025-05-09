package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateHiring godoc
// @Summary Creates a new hiring request
// @Description This endpoint creates a new hiring request for housekeepers and employers
// @Tags hiring
// @Accept json
// @Produce json
// @Param hiring body models.Hiring true "Hiring request data"
// @Success 201 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /create-hiring [post]
func CreateHiring(c *gin.Context) {
	var hiring models.Hiring
	if err := c.ShouldBindJSON(&hiring); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hiring.Status = models.Pending
	hiring.CreatedAt = time.Now()
	hiring.UpdatedAt = time.Now()

	var employer models.Employer
	var housekeeper models.Housekeeper

	// hiring.EmployerID, _ = primitive.ObjectIDFromHex(hiring.EmployerID.Hex())

	fmt.Println(hiring.EmployerID)
	err := config.DB.Collection("employers").FindOne(context.Background(), bson.M{"_id": hiring.EmployerID}).Decode(&employer)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employer not found"})
		return
	}

	err = config.DB.Collection("housekeepers").FindOne(context.Background(), bson.M{"_id": hiring.HousekeeperID}).Decode(&housekeeper)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Housekeeper not found"})
		return
	}

	result, err := config.DB.Collection("hirings").InsertOne(context.Background(), hiring)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create hiring request"})
		return
	}

	go sendHiringEmail(employer, housekeeper, hiring)

	c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}

func sendHiringEmail(employer models.Employer, housekeeper models.Housekeeper, hiring models.Hiring) {
	from := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	to := os.Getenv("ADMIN_EMAIL")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	message := fmt.Sprintf(`
		Subject: New Hiring Request

		Employer Details:
		Name: %s
		Email: %s
		Phone: %s
		Address: %s
		Family Size: %d

		Housekeeper Details:
		Name: %s
		Category: %s
		Employment Type: %s
		Experience: %d years

		Hiring Details:
		Salary offered: $%.2f
		Start Date: %s
		Delivery Type: %s
		Requirements: %s
	`,
		employer.Name, employer.Email, employer.PhoneNumber, employer.Address, employer.FamilySize,
		housekeeper.Name, housekeeper.Category, housekeeper.EmploymentType, housekeeper.Experience,
		hiring.SalaryOffer, hiring.StartDate.Format("2006-01-02"), hiring.DeliveryType, hiring.Requirements)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(message))
	if err != nil {
		fmt.Println("Error sending email: ", err)
	}

}

// GetHiringStatus godoc
// @Summary Fetches the status of a hiring request
// @Description This endpoint retrieves the status of a specific hiring request by its ID
// @Tags hiring
// @Accept json
// @Produce json
// @Param id path string true "Hiring request ID"
// @Success 200 {object} models.HiringResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /hiring/{id} [get]
func GetHiringStatus(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var hiring models.Hiring
	err = config.DB.Collection("hirings").FindOne(context.Background(), bson.M{"_id": id}).Decode(&hiring)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hiring not found"})
		return
	}

	c.JSON(http.StatusOK, hiring)
}

func UpdateHiringStatus(c *gin.Context) {
	hiringID := c.Param("id")
	var statusUpdate struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Find the hiring request by ID
	collection := config.DB.Collection("hirings") // Ensure the correct collection name
	hiringObjectID, err := primitive.ObjectIDFromHex(hiringID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Hiring ID"})
		return
	}

	// Update statement using the correct BSON structure with keyed fields
	update := bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "status", Value: statusUpdate.Status},
			{Key: "updated_at", Value: time.Now()},
		}},
	}

	result, err := collection.UpdateOne(
		c,
		bson.D{{Key: "_id", Value: hiringObjectID}},
		update,
	)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Hiring not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hiring status"})
		}
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hiring not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Hiring status updated successfully"})
}

func GetHiringHistory(c *gin.Context) {
	// Get employer ID from request parameters
	employerID := c.Param("employer_id")
	objID, err := primitive.ObjectIDFromHex(employerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employer ID"})
		return
	}

	// Query the database for hiring records
	var hirings []models.Hiring
	cursor, err := config.DB.Collection("hirings").Find(context.Background(), bson.M{"employer_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch hiring history"})
		return
	}

	// Decode the hiring records
	if err := cursor.All(context.Background(), &hirings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode hiring history"})
		return
	}

	// Return hiring history as JSON response
	c.JSON(http.StatusOK, hirings)
}
