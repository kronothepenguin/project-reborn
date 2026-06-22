package dotenv

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

func Load() error {
	f, err := os.OpenFile(".env", os.O_RDONLY, os.ModePerm)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		text := scanner.Text()
		index := strings.Index(text, "=")
		if index == -1 {
			continue
		}

		key := strings.TrimSpace(text[:index])
		value := strings.TrimSpace(text[index+1:])
		os.Setenv(key, value)
	}

	return nil
}

func GetenvString(key string, def string) string {
	value := os.Getenv(key)
	if value == "" {
		value = def
	}
	return value
}

func GetenvInt(key string, def int) int {
	raw := os.Getenv(key)
	value, err := strconv.Atoi(raw)
	if raw == "" || err != nil {
		value = def
	}
	return value
}
