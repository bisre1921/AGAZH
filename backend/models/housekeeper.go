package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category string
type EmploymentType string

const (
	Normal    Category = "NORMAL"
	ChildCare Category = "CHILD_CARE"
	Cleaner   Category = "CLEANER"

	FullTime EmploymentType = "FULL_TIME"
	PartTime EmploymentType = "PART_TIME"
)

type Housekeeper struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name           string             `json:"name,omitempty" bson:"name,omitempty" binding:"required"`
	Email          string             `json:"email,omitempty" bson:"email,omitempty" binding:"required,email"`
	Password       string             `json:"password,omitempty" bson:"password,omitempty" binding:"required"`
	Age            int                `json:"age,omitempty" bson:"age,omitempty" binding:"required"`
	Experience     int                `json:"experience,omitempty" bson:"experience,omitempty"`
	Category       Category           `json:"category,omitempty" bson:"category,omitempty" binding:"required"`
	EmploymentType EmploymentType     `json:"employment_type,omitempty" bson:"employment_type,omitempty" binding:"required"`
	Skills         []string           `json:"skills,omitempty" bson:"skills,omitempty"`
	PhotoURL       string             `json:"photo_url,omitempty" bson:"photo_url,omitempty"`
	Certifications []string           `json:"certifications,omitempty" bson:"certifications,omitempty"`
	Location       string             `json:"location,omitempty" bson:"location,omitempty" binding:"required"`
	PhoneNumber    string             `json:"phone_number,omitempty" bson:"phone_number,omitempty" binding:"required"`
	Rating         float64            `json:"rating,omitempty" bson:"rating,omitempty"`
	Reviews        []Review           `json:"reviews,omitempty" bson:"reviews,omitempty"`
	IsAvailable    bool               `json:"is_available,omitempty" bson:"is_available,omitempty"`
	CreatedAt      time.Time          `json:"created_at,omitempty" bson:"created_at,omitempty"`
	UpdatedAt      time.Time          `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
}
