package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Employer struct {
	ID                     primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name                   string             `json:"name,omitempty" bson:"name,omitempty" binding:"required"`
	Email                  string             `json:"email,omitempty" bson:"email,omitempty" binding:"required,email"`
	Password               string             `json:"password,omitempty" bson:"password,omitempty" binding:"required"`
	Address                string             `json:"address,omitempty" bson:"address,omitempty" binding:"required"`
	PhoneNumber            string             `json:"phone_number,omitempty" bson:"phone_number,omitempty" binding:"required"`
	ReligionPreference     string             `json:"religion_preference,omitempty" bson:"religion_preference,omitempty"`
	PlaceOfBirthPreference string             `json:"place_of_birth_preference,omitempty" bson:"place_of_birth_preference,omitempty"`
	FamilySize             int                `json:"family_size,omitempty" bson:"family_size,omitempty"`
	CreatedAt              time.Time          `json:"created_at,omitempty" bson:"created_at,omitempty"`
	UpdatedAt              time.Time          `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
}
