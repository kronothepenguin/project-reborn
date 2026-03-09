package validator

type Email struct {
	Value   string
	Confirm string
}

func (e *Email) Validate() error {
	return nil
}
