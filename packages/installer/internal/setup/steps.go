package setup

import "slices"

// Steps are the installer's steps, in the order the administrator walks them.
// Each is the last segment of its path under /installer/.
var Steps = []string{"config", "site", "settings", "client", "admin"}

// Waiting returns the first step that waits. The config step passes once
// config.json is written; every other step passes in this run of the
// installer, so a restarted installer continues at the site step.
func (s *State) Waiting() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	passed := s.passed
	if s.installation.DB != nil {
		passed = max(passed, 1)
	}
	return Steps[min(passed, len(Steps)-1)]
}

// Pass records that step is done, so that the step after it waits.
func (s *State) Pass(step string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.passed = max(s.passed, slices.Index(Steps, step)+1)
}
