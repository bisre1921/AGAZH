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
)

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
