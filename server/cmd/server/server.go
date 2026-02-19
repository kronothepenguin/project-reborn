package main

import "github.com/kronothepenguin/project-reborn/internal/app/habbo"

func main() {
	s := habbo.NewServer()
	s.RunTCP()
}
