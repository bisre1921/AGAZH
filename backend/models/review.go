package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Review struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	EmployerID    primitive.ObjectID `json:"employer_id,omitempty" bson:"employer_id,omitempty"`
	HousekeeperID primitive.ObjectID `json:"housekeeper_id,omitempty" bson:"housekeeper_id,omitempty"`
	Rating        float64            `json:"rating,omitempty" bson:"rating,omitempty" binding:"required,min=1,max=5"`
	Comment       string             `json:"comment,omitempty" bson:"comment,omitempty"`
	CreatedAt     time.Time          `json:"created_at,omitempty" bson:"created_at,omitempty"`
}
