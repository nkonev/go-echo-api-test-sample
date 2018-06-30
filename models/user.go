package user

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/labstack/gommon/log"
)

type (
	UserModelImpl interface {
		FindByID(id string) User
		FindAll() ([]User, error)
	}

	User struct {
		ID   int    `json:"id" db:"id"`
		Name string `json:"name" db:"name"`
		Surname string
		Lastname string
	}

	UserModel struct {
		db *sqlx.DB
	}
)

func NewUserModel(db *sqlx.DB) *UserModel {
	return &UserModel{
		db: db,
	}
}

func (u *UserModel) FindByID(id string) User {
	user := User{}
	u.db.Get(&user, "SELECT * FROM users where id = $1 limit 1", id)

	return user
}

func (u *UserModel) FindAll() ([]User, error) {
	users := []User{}
	e := u.db.Select(&users, "SELECT * FROM users order by id asc")
	if e !=nil {
		log.Errorf("An error occurred during get users %v", e)
		return nil, e
	}
	return users, nil
}