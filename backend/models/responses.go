package models

// GenericResponse represents a generic success response
type GenericResponse struct {
	Message string      `json:"message"`
	ID      interface{} `json:"id,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// TokenResponse represents a JWT response
type TokenResponse struct {
	Token string `json:"token"`
}

// HiringResponse represents the detailed response for a hiring request
type HiringResponse struct {
	ID        string `json:"id"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// ReviewResponse represents a review creation response
type ReviewResponse struct {
	ID string `json:"id"`
}

// ReviewsResponse represents a list of reviews response
type ReviewsResponse struct {
	Reviews []Review `json:"reviews"`
}

// LoginCredentials represents the login credentials
type LoginCredentials struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	UserType string `json:"user_type" binding:"required"` // housekeeper or employer
}
