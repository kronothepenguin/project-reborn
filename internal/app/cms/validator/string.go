package validator

import "errors"

var (
	ErrInvalidMinLength = errors.New("min_length")
	ErrInvalidMaxLength = errors.New("max_length")
	ErrStringsNotEqual  = errors.New("not_equal")
)

func ValidateMinLength(s string, min int) error {
	if len(s) < min {
		return ErrInvalidMinLength
	}
	return nil
}

func ValidateMaxLength(s string, max int) error {
	if len(s) > max {
		return ErrInvalidMaxLength
	}
	return nil
}

func ValidateEquality(s1, s2 string) error {
	if s1 != s2 {
		return ErrStringsNotEqual
	}
	return nil
}
