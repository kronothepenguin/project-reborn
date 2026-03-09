package validator

import (
	"errors"
	"time"
)

var (
	ErrInvalidDate = errors.New("invalid_date")
)

type Date struct {
	Day   string
	Month string
	Year  string
}

func (d *Date) Validate() error {
	input := d.Year + "-" + d.Month + "-" + d.Day
	t, err := time.Parse(time.DateOnly, input)
	if err != nil {
		return err
	}
	if t.Format(time.DateOnly) != input {
		return ErrInvalidDate
	}
	return nil
}
