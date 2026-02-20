package main

import "github.com/kronothepenguin/project-reborn/internal/app/habbo"

func main() {
	app := habbo.New()
	if err := app.Run(); err != nil {
		panic(err)
	}
}
