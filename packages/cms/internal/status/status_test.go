package status

import "testing"

func TestSampleReportsUpAndSampleOnline(t *testing.T) {
	var provider Provider = Sample{}

	got, err := provider.Snapshot(t.Context())
	if err != nil {
		t.Fatalf("Snapshot: %v", err)
	}
	if !got.Up {
		t.Error("Up = false, want the sample to be online")
	}
	if got.Online != 12345 {
		t.Errorf("Online = %d, want the sample count 12345", got.Online)
	}
}
