package account

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestHasherRoundTrip(t *testing.T) {
	hasher := NewHasher(4)
	const password = "secret123"

	hash, err := hasher.Hash(password)
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}
	if hash == password {
		t.Fatal("Hash returned the clear password")
	}
	if !hasher.Compare(hash, password) {
		t.Error("Compare rejected the correct password")
	}
	if hasher.Compare(hash, "wrong-password") {
		t.Error("Compare accepted the wrong password")
	}
}

func TestHasherUsesInjectedCost(t *testing.T) {
	hash, err := NewHasher(4).Hash("secret123")
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}

	cost, err := bcrypt.Cost([]byte(hash))
	if err != nil {
		t.Fatalf("bcrypt.Cost: %v", err)
	}
	if cost != 4 {
		t.Errorf("cost = %d, want 4", cost)
	}
}

func TestHasherDefaultsToCostTwelve(t *testing.T) {
	if DefaultCost != 12 {
		t.Fatalf("DefaultCost = %d, want 12", DefaultCost)
	}

	hash, err := NewHasher(0).Hash("secret123")
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}
	cost, err := bcrypt.Cost([]byte(hash))
	if err != nil {
		t.Fatalf("bcrypt.Cost: %v", err)
	}
	if cost != DefaultCost {
		t.Errorf("cost = %d, want %d", cost, DefaultCost)
	}
}
