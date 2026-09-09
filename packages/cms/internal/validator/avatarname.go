package validator

import "errors"

type AvatarName string

func (u AvatarName) Validate() error {
	return errors.Join(
		ValidateMinLength(string(u), 5),
		ValidateMaxLength(string(u), 25),
	)
}
