package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func validateName(name string) error {
	if name == "" {
		return errors.New("name is required")
	}
	if name[0] < 'a' || name[0] > 'z' {
		return errors.New("name must start with a lowercase letter: " + name)
	}

	for i := 0; i < len(name); i++ {
		c := name[i]
		if !((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-') {
			return errors.New("name may contain only lowercase letters, digits, and '-': " + name)
		}
	}

	return nil
}

func describe(code int, err error) string {
	if err == nil {
		return "exit " + strconv.Itoa(code)
	}
	return "exit " + strconv.Itoa(code) + ": " + err.Error()
}

func run(root, name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = root
	return cmd.Run()
}

func scaffold(root, name string, appPort, astroPort uint, dryRun bool) error {
	if err := validateName(name); err != nil {
		return err
	}

	pkgDir := filepath.Join(root, "/packages/", name)
	appDir := filepath.Join(root, "/apps/", name)

	if _, err := os.Stat(pkgDir); err == nil {
		return errors.New("packages/" + name + " already exists")
	}
	if _, err := os.Stat(appDir); err == nil {
		return errors.New("apps/" + name + " already exists")
	}

	if appPort == 0 {
		appPort = uint(AppPort(name))
	}
	if astroPort == 0 {
		astroPort = uint(AstroPort(name))
	}

	if dryRun {
		printPlan(root, name, int(appPort), int(astroPort))
		return nil
	}

	if err := write(root, name, int(appPort), int(astroPort)); err != nil {
		return err
	}

	relAppDir, err := filepath.Rel(root, appDir)
	if err != nil {
		return err
	}
	if err := run(root, "go", "work", "use", relAppDir); err != nil {
		return err
	}

	relPkgDir, err := filepath.Rel(root, pkgDir)
	if err != nil {
		return err
	}
	if err := run(root, "go", "work", "use", relPkgDir); err != nil {
		return err
	}

	if err := run(root, "go", "work", "sync"); err != nil {
		return err
	}

	if err := run(pkgDir, "go", "mod", "tidy", "-e"); err != nil {
		return err
	}
	if err := run(appDir, "go", "mod", "tidy", "-e"); err != nil {
		return err
	}
	if err := run(pkgDir, "pnpm", "install"); err != nil {
		return err
	}

	printPlan(root, name, int(appPort), int(astroPort))
	return nil
}

// printPlan walks the embedded templates and prints the files that would be
// (or were) created.
func printPlan(root, name string, appPort, astroPort int) {
	fmt.Println()
	fmt.Println("created:")
	fmt.Println("  packages/" + name + "/")
	fmt.Println("  apps/" + name + "/")

	fs.WalkDir(templatesFS, "templates", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		filename, err := filepath.Rel("templates", path)
		if err != nil {
			return err
		}

		filename = strings.TrimSuffix(filename, ".tmpl")
		filename = strings.ReplaceAll(filename, "[[name]]", name)

		target := filepath.Join(root, filename)

		fmt.Println("  " + target)
		return nil
	})

	fmt.Println()
	fmt.Println("ports:")
	fmt.Println("  app:   http://localhost:" + strconv.Itoa(appPort))
	fmt.Println("  astro: http://localhost:" + strconv.Itoa(astroPort))
	fmt.Println()
	fmt.Println("next:")
	fmt.Println("  make dev        # in apps/" + name + ": astro (background) + air hot reload")
	fmt.Println("  make install    # at repo root: wires go workspace + pnpm + tools")
	fmt.Println()
}
