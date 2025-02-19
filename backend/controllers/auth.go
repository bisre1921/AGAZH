package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func RegisterHouseKeeper(c *gin.Context) {
	var housekeeper models.Housekeeper
	if err := c.ShouldBindJSON(&housekeeper); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(housekeeper.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing the password"})
		return
	}

	housekeeper.Password = string(hashedPassword)
	housekeeper.CreatedAt = time.Now()
	housekeeper.UpdatedAt = time.Now()
	housekeeper.Rating = 0
	housekeeper.IsAvailable = true

	result, err := config.DB.Collection("housekeepers").InsertOne(context.Background(), housekeeper)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting housekeeper"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Housekeeper registered successfully", "id": result.InsertedID})
}

func RegisterEmployer(c *gin.Context) {
	var employer models.Employer
	if err := c.ShouldBindJSON(&employer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(employer.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing the password"})
		return
	}

	employer.Password = string(hashedPassword)
	employer.CreatedAt = time.Now()
	employer.UpdatedAt = time.Now()

	result, err := config.DB.Collection("employers").InsertOne(context.Background(), employer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting employer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employer registered successfully", "id": result.InsertedID})
}
