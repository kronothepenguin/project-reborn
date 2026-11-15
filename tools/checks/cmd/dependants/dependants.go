package main

import (
	"bufio"
	"bytes"
	"encoding/json/v2"
	"fmt"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
)

// graph maps each project folder, relative to the root and slash-separated,
// to the folders of the projects that use it directly.
type graph map[string]map[string]bool

func (g graph) add(folder string) {
	if g[folder] == nil {
		g[folder] = map[string]bool{}
	}
}

func (g graph) link(user, used string) {
	if user != used {
		g[used][user] = true
	}
}

// dependants returns, sorted, every project of the workspace at root that uses
// project directly or through another project.
func dependants(root, project string) ([]string, error) {
	g := graph{}
	if err := addGo(g, root); err != nil {
		return nil, err
	}
	if err := addPackages(g, root); err != nil {
		return nil, err
	}
	project = filepath.ToSlash(filepath.Clean(project))
	if _, ok := g[project]; !ok {
		return nil, fmt.Errorf("%s is not a project of the workspace", project)
	}
	seen := map[string]bool{project: true}
	queue := []string{project}
	for len(queue) > 0 {
		used := queue[0]
		queue = queue[1:]
		for user := range g[used] {
			if !seen[user] {
				seen[user] = true
				queue = append(queue, user)
			}
		}
	}
	delete(seen, project)
	var out []string
	for folder := range seen {
		out = append(out, folder)
	}
	slices.Sort(out)
	return out, nil
}

func rel(root, path string) (string, error) {
	r, err := filepath.Rel(root, path)
	if err != nil {
		return "", err
	}
	return filepath.ToSlash(r), nil
}

// addGo adds the modules of go.work and links each one to the modules its Go
// files import, tests included.
func addGo(g graph, root string) error {
	if _, err := os.Stat(filepath.Join(root, "go.work")); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	cmd := exec.Command("go", "work", "edit", "-json")
	cmd.Dir = root
	out, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("go work edit -json: %w", err)
	}
	var work struct {
		Use []struct{ DiskPath string }
	}
	if err := json.Unmarshal(out, &work); err != nil {
		return fmt.Errorf("go.work: %w", err)
	}
	modules := map[string]string{}
	var folders []string
	for _, use := range work.Use {
		folder, err := rel(root, filepath.Join(root, use.DiskPath))
		if err != nil {
			return err
		}
		path, err := modulePath(filepath.Join(root, folder, "go.mod"))
		if err != nil {
			return err
		}
		g.add(folder)
		modules[path] = folder
		folders = append(folders, folder)
	}
	for _, folder := range folders {
		imports, err := goImports(filepath.Join(root, folder))
		if err != nil {
			return err
		}
		for imp := range imports {
			if used, ok := moduleOf(modules, imp); ok {
				g.link(folder, used)
			}
		}
	}
	return nil
}

func modulePath(gomod string) (string, error) {
	data, err := os.ReadFile(gomod)
	if err != nil {
		return "", err
	}
	scanner := bufio.NewScanner(bytes.NewReader(data))
	for scanner.Scan() {
		if path, ok := strings.CutPrefix(strings.TrimSpace(scanner.Text()), "module "); ok {
			return strings.Trim(strings.TrimSpace(path), `"`), nil
		}
	}
	return "", fmt.Errorf("%s: no module line", gomod)
}

// moduleOf returns the folder of the module that holds the package imp, the
// longest module path that is imp or a parent of it.
func moduleOf(modules map[string]string, imp string) (string, bool) {
	for path, ok := imp, true; ok; path, _, ok = strings.CutLast(path, "/") {
		if folder, found := modules[path]; found {
			return folder, true
		}
	}
	return "", false
}

// goImports reads the imports of every Go file of the module at dir, leaving
// out the folders the go tool ignores and the nested modules.
func goImports(dir string) (map[string]bool, error) {
	imports := map[string]bool{}
	fset := token.NewFileSet()
	err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			name := d.Name()
			if path == dir {
				return nil
			}
			if strings.HasPrefix(name, ".") || strings.HasPrefix(name, "_") ||
				name == "testdata" || name == "vendor" || name == "node_modules" {
				return filepath.SkipDir
			}
			if _, err := os.Stat(filepath.Join(path, "go.mod")); err == nil {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(path, ".go") {
			return nil
		}
		file, err := parser.ParseFile(fset, path, nil, parser.ImportsOnly)
		if err != nil {
			return err
		}
		for _, spec := range file.Imports {
			imp, err := strconv.Unquote(spec.Path.Value)
			if err != nil {
				return err
			}
			imports[imp] = true
		}
		return nil
	})
	return imports, err
}

type packageJSON struct {
	Name                 string            `json:"name"`
	Dependencies         map[string]string `json:"dependencies"`
	DevDependencies      map[string]string `json:"devDependencies"`
	PeerDependencies     map[string]string `json:"peerDependencies"`
	OptionalDependencies map[string]string `json:"optionalDependencies"`
}

// addPackages adds the folders of the pnpm workspace and the tools with a
// package.json, and links each package to the workspace packages it depends on.
func addPackages(g graph, root string) error {
	folders, err := workspaceFolders(root)
	if err != nil {
		return err
	}
	tools, err := filepath.Glob(filepath.Join(root, "tools", "*", "package.json"))
	if err != nil {
		return err
	}
	for _, manifest := range tools {
		folders = append(folders, filepath.Dir(manifest))
	}
	names := map[string]string{}
	manifests := map[string]packageJSON{}
	for _, dir := range folders {
		data, err := os.ReadFile(filepath.Join(dir, "package.json"))
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			return err
		}
		var pkg packageJSON
		if err := json.Unmarshal(data, &pkg); err != nil {
			return fmt.Errorf("%s: %w", filepath.Join(dir, "package.json"), err)
		}
		folder, err := rel(root, dir)
		if err != nil {
			return err
		}
		g.add(folder)
		manifests[folder] = pkg
		if pkg.Name != "" {
			names[pkg.Name] = folder
		}
	}
	for folder, pkg := range manifests {
		for _, deps := range []map[string]string{pkg.Dependencies, pkg.DevDependencies, pkg.PeerDependencies, pkg.OptionalDependencies} {
			for name, spec := range deps {
				used, ok := names[name]
				if ok && strings.HasPrefix(spec, "workspace:") {
					g.link(folder, used)
				}
			}
		}
	}
	return nil
}

// workspaceFolders expands the globs of the packages list of
// pnpm-workspace.yaml. It reads that list only, one "- glob" a line, and drops
// the folders a "!glob" excludes.
func workspaceFolders(root string) ([]string, error) {
	data, err := os.ReadFile(filepath.Join(root, "pnpm-workspace.yaml"))
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	included := map[string]bool{}
	excluded := map[string]bool{}
	inPackages := false
	scanner := bufio.NewScanner(bytes.NewReader(data))
	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		if line == trimmed && !strings.HasPrefix(trimmed, "-") {
			inPackages = trimmed == "packages:"
			continue
		}
		item, ok := strings.CutPrefix(trimmed, "- ")
		if !inPackages || !ok {
			continue
		}
		glob := strings.Trim(strings.TrimSpace(item), `"'`)
		target := included
		if rest, ok := strings.CutPrefix(glob, "!"); ok {
			glob, target = rest, excluded
		}
		matches, err := filepath.Glob(filepath.Join(root, filepath.FromSlash(glob)))
		if err != nil {
			return nil, fmt.Errorf("pnpm-workspace.yaml: %w", err)
		}
		for _, m := range matches {
			if info, err := os.Stat(m); err == nil && info.IsDir() {
				target[m] = true
			}
		}
	}
	var folders []string
	for dir := range included {
		if !excluded[dir] {
			folders = append(folders, dir)
		}
	}
	slices.Sort(folders)
	return folders, scanner.Err()
}
