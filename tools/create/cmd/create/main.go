package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	appPort := flag.Uint("app-port", 0, "override the application `port` (default: derived from name)")
	astroPort := flag.Uint("astro-port", 0, "override the astro dev `port` (default: derived from name)")
	dryRun := flag.Bool("dry-run", false, "print what would be created and exit")

	flag.Parse()

	if flag.NArg() != 1 {
		fmt.Fprintln(os.Stderr, "usage: create [-app-port N] [-astro-port N] [-dry-run] <name>")
		os.Exit(2)
	}

	root, err := os.Getwd()
	if err != nil {
		fmt.Fprintln(os.Stderr, "create: "+err.Error())
		os.Exit(1)
	}

	if err := scaffold(root, flag.Arg(0), *appPort, *astroPort, *dryRun); err != nil {
		fmt.Fprintln(os.Stderr, "create: "+err.Error())
		os.Exit(1)
	}
}
