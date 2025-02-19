package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HiringStatus string

const (
	Pending   HiringStatus = "PENDING"
	Approved  HiringStatus = "APPROVED"
	Rejected  HiringStatus = "REJECTED"
	Completed HiringStatus = "COMPLETED"
)

type Hiring struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	EmployerID    primitive.ObjectID `json:"employer_id,omitempty" bson:"employer_id,omitempty"`
	HousekeeperID primitive.ObjectID `json:"housekeeper_id,omitempty" bson:"housekeeper_id,omitempty"`
	Status        HiringStatus       `json:"status,omitempty" bson:"status,omitempty"`
	Requirements  string             `json:"requirements,omitempty" bson:"requirements,omitempty"`
	SalaryOffer   float64            `json:"salary_offer,omitempty" bson:"salary_offer,omitempty"`
	StartDate     time.Time          `json:"start_date,omitempty" bson:"start_date,omitempty"`
	DeliveryType  string             `json:"delivery_type,omitempty" bson:"delivery_type,omitempty"`
	CreatedAt     time.Time          `json:"created_at,omitempty" bson:"created_at,omitempty"`
	UpdatedAt     time.Time          `json:"update_at,omitempty" bson:"update_at,omitempty"`
}
