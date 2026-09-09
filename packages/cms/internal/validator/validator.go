package validator

import "errors"

type Validator interface {
	Validate() error
}

func Validate(validators ...Validator) error {
	var errs []error
	for _, v := range validators {
		errs = append(errs, v.Validate())
	}
	return errors.Join(errs...)
}
