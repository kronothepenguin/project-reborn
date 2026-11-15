// Command dependants prints, one folder a line and sorted, every project of
// the workspace that uses the given project folder, directly or through
// another project. It runs from the repository root.
package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: dependants <project folder>")
		os.Exit(2)
	}
	folders, err := dependants(".", os.Args[1])
	if err != nil {
		fmt.Fprintln(os.Stderr, "dependants:", err)
		os.Exit(1)
	}
	for _, folder := range folders {
		fmt.Println(folder)
	}
}
