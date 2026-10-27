package auth

import (
	"encoding/json"
	"testing"
)

func defaults() Auth {
	return Auth{
		SecureCookies:      DefaultSecureCookies(),
		SessionIdleMinutes: DefaultSessionIdleMinutes(),
		RememberDays:       DefaultRememberDays(),
		LoginMaxFailures:   DefaultLoginMaxFailures(),
		LoginWindowMinutes: DefaultLoginWindowMinutes(),
		PasswordMinLength:  DefaultPasswordMinLength(),
		PasswordMaxLength:  DefaultPasswordMaxLength(),
		ResetTokenMinutes:  DefaultResetTokenMinutes(),
	}
}

func TestDefaultsSatisfyTheirValidators(t *testing.T) {
	for key, err := range map[string]error{
		"secureCookies":      ValidateSecureCookies(DefaultSecureCookies()),
		"sessionIdleMinutes": ValidateSessionIdleMinutes(DefaultSessionIdleMinutes()),
		"rememberDays":       ValidateRememberDays(DefaultRememberDays()),
		"loginMaxFailures":   ValidateLoginMaxFailures(DefaultLoginMaxFailures()),
		"loginWindowMinutes": ValidateLoginWindowMinutes(DefaultLoginWindowMinutes()),
		"passwordMinLength":  ValidatePasswordMinLength(DefaultPasswordMinLength()),
		"passwordMaxLength":  ValidatePasswordMaxLength(DefaultPasswordMaxLength()),
		"resetTokenMinutes":  ValidateResetTokenMinutes(DefaultResetTokenMinutes()),
	} {
		if err != nil {
			t.Errorf("default %s is invalid: %v", key, err)
		}
	}
	if err := defaults().Validate(); err != nil {
		t.Errorf("Validate() on the defaults = %v, want nil", err)
	}
}

func TestValidators(t *testing.T) {
	for _, c := range []struct {
		key      string
		validate func(int) error
		valid    []int
		invalid  []int
	}{
		{"sessionIdleMinutes", ValidateSessionIdleMinutes, []int{5, 30, 1440}, []int{4, 1441}},
		{"rememberDays", ValidateRememberDays, []int{1, 100, 365}, []int{0, 366}},
		{"loginMaxFailures", ValidateLoginMaxFailures, []int{1, 5, 100}, []int{0, 101}},
		{"loginWindowMinutes", ValidateLoginWindowMinutes, []int{1, 15, 1440}, []int{0, 1441}},
		{"passwordMinLength", ValidatePasswordMinLength, []int{6, 8, 128}, []int{5, 129}},
		{"passwordMaxLength", ValidatePasswordMaxLength, []int{6, 25, 1024}, []int{5, 1025}},
		{"resetTokenMinutes", ValidateResetTokenMinutes, []int{5, 60, 1440}, []int{4, 1441}},
	} {
		for _, value := range c.valid {
			if err := c.validate(value); err != nil {
				t.Errorf("%s %d rejected: %v", c.key, value, err)
			}
		}
		for _, value := range c.invalid {
			if err := c.validate(value); err == nil {
				t.Errorf("%s %d accepted, want an error", c.key, value)
			}
		}
	}
	for _, secure := range []bool{true, false} {
		if err := ValidateSecureCookies(secure); err != nil {
			t.Errorf("secureCookies %t rejected: %v", secure, err)
		}
	}
}

func TestPasswordMaxLengthMustCoverMinLength(t *testing.T) {
	a := defaults()
	a.PasswordMinLength = 30
	a.PasswordMaxLength = 25
	if err := a.Validate(); err == nil {
		t.Error("Validate() accepted passwordMaxLength below passwordMinLength")
	}
}

func TestJSONTags(t *testing.T) {
	in := Auth{
		SecureCookies:      true,
		SessionIdleMinutes: 31,
		RememberDays:       7,
		LoginMaxFailures:   3,
		LoginWindowMinutes: 10,
		PasswordMinLength:  8,
		PasswordMaxLength:  64,
		ResetTokenMinutes:  30,
	}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	want := `{"secureCookies":true,"sessionIdleMinutes":31,"rememberDays":7,"loginMaxFailures":3,` +
		`"loginWindowMinutes":10,"passwordMinLength":8,"passwordMaxLength":64,"resetTokenMinutes":30}`
	if string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Auth
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
