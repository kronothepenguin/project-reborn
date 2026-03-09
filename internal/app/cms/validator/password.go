package validator

import "errors"

type Password struct {
	Value   string
	Confirm string
}

func (p *Password) Validate() error {
	return errors.Join(
		ValidateMinLength(string(p.Value), 5),
		ValidateMaxLength(string(p.Confirm), 64),
		ValidateEquality(p.Value, p.Confirm),
	)
}
