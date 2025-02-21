package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

// RegisterHouseKeeper godoc
// @Summary Registers a new housekeeper
// @Description This endpoint registers a new housekeeper
// @Tags auth
// @Accept json
// @Produce json
// @Param housekeeper body models.Housekeeper true "Housekeeper data"
// @Success 201 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /register-housekeeper [post]
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

	c.JSON(http.StatusCreated, gin.H{"message": "Housekeeper registered successfully", "id": result.InsertedID})
}

// RegisterEmployer godoc
// @Summary Registers a new employer
// @Description This endpoint registers a new employer
// @Tags auth
// @Accept json
// @Produce json
// @Param employer body models.Employer true "Employer data"
// @Success 201 {object} models.GenericResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /register-employer [post]
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

	c.JSON(http.StatusCreated, gin.H{"message": "Employer registered successfully", "id": result.InsertedID})
}

// Login godoc
// @Summary Logs in a user and generates a JWT token
// @Description This endpoint logs in either a housekeeper or employer and generates a JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body models.LoginCredentials true "Login credentials"
// @Success 201 {object} models.TokenResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /login [post]
func Login(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
		UserType string `json:"user_type" binding:"required"` // housekeeper or employer
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var collection string
	if credentials.UserType == "housekeeper" {
		collection = "housekeepers"
	} else {
		collection = "employers"
	}

	var user bson.M
	err := config.DB.Collection(collection).FindOne(context.Background(), bson.M{"email": credentials.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user["password"].(string)), []byte(credentials.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// generate JWT token
	claims := jwt.MapClaims{
		"user_id":   user["_id"],
		"user_type": credentials.UserType,
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	JWT_SECRET := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(JWT_SECRET))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"token": tokenString})
}
