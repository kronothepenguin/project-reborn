package installer

import (
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// forms builds the installer both ways, at the client files step: run alone
// and inside reborn.
var forms = []struct {
	name  string
	build func(t *testing.T) (*Installer, *http.ServeMux)
}{
	{"alone", func(t *testing.T) (*Installer, *http.ServeMux) {
		i, mux := mounted(t)
		expect(t, send(t, mux, "POST", "/installer/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}),
			303, "/installer/site", "")
		return i, mux
	}},
	{"inside reborn", func(t *testing.T) (*Installer, *http.ServeMux) {
		i, mux := inReborn(t, &fakeListener{})
		expect(t, send(t, mux, "POST", "/installer/config", url.Values{"host": {"localhost"}, "port": {"16416"}}),
			303, "/installer/site", "")
		return i, mux
	}},
}

// clientFolder writes the client's files into assets/dcr of the working
// directory and returns the folder as the page names it.
func clientFolder(t *testing.T, files map[string]string) string {
	t.Helper()
	if err := os.MkdirAll(filepath.Join("assets", "dcr"), 0o755); err != nil {
		t.Fatal(err)
	}
	for name, content := range files {
		if err := os.WriteFile(filepath.Join("assets", "dcr", name), []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	folder, err := filepath.Abs(filepath.Join("assets", "dcr"))
	if err != nil {
		t.Fatal(err)
	}
	return folder + string(filepath.Separator)
}

var bothFiles = map[string]string{
	"external_variables.txt": "site.url=http://localhost\r\nclient.version.id=26",
	"external_texts.txt":     "\xef\xbb\xbfhello=Hello\r\nbye=Bye\r\nyes=Yes\r\n",
}

// counts returns how many variables and texts of the client the database holds.
func counts(t *testing.T, i *Installer) (int64, int64) {
	t.Helper()
	installation, _ := i.setup.Current()
	q := store.New(installation.DB)
	variables, err := q.CountDCRVariables(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	texts, err := q.CountDCRTexts(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	return variables, texts
}

// The client files step opens: it names the folder it reads and each file it found there, with its count of lines.
func TestTheClientFilesStepNamesTheFolderAndItsFiles(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			_, mux := form.build(t)
			toClient(t, mux)
			folder := clientFolder(t, bothFiles)

			expect(t, send(t, mux, "GET", "/installer/client", nil), 200, "",
				" Folder:"+folder+" Files:[{Name:external_variables.txt Found:true Lines:2} {Name:external_texts.txt Found:true Lines:3}] Missing:false}")
		})
	}
}

// The administrator imports the client files: the client's variables and texts are saved, and the administrator
// step follows.
func TestImportingTheClientFilesSavesThem(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			toClient(t, mux)
			clientFolder(t, bothFiles)

			expect(t, send(t, mux, "POST", "/installer/client", url.Values{"action": {"import"}}), 303, "/installer/admin", "")

			if variables, texts := counts(t, i); variables != 2 || texts != 3 {
				t.Errorf("the database holds %d variables and %d texts, want 2 and 3", variables, texts)
			}
			expect(t, send(t, mux, "GET", "/installer/admin", nil), 200, "", "PasswordHelp:")
		})
	}
}

// A file is missing: the step says where to put it, offers "Check again", and imports nothing.
func TestAMissingClientFileImportsNothing(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			toClient(t, mux)
			folder := clientFolder(t, map[string]string{"external_variables.txt": bothFiles["external_variables.txt"]})

			expect(t, send(t, mux, "GET", "/installer/client", nil), 200, "",
				" Folder:"+folder+" Files:[{Name:external_variables.txt Found:true Lines:2} {Name:external_texts.txt Found:false Lines:0}] Missing:true}")
			expect(t, send(t, mux, "POST", "/installer/client", url.Values{"action": {"import"}}), 422, "", "Missing:true")
			if variables, texts := counts(t, i); variables != 0 || texts != 0 {
				t.Errorf("the database holds %d variables and %d texts, want none", variables, texts)
			}
			expect(t, send(t, mux, "GET", "/installer/admin", nil), 303, "/installer/client", "")

			// Check again finds the file put in the folder.
			clientFolder(t, bothFiles)
			expect(t, send(t, mux, "GET", "/installer/client", nil), 200, "", "Missing:false")
		})
	}
}

// The administrator skips the client files step: nothing is imported, and the administrator step follows.
func TestSkippingTheClientFilesImportsNothing(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			toClient(t, mux)
			clientFolder(t, bothFiles)

			expect(t, send(t, mux, "POST", "/installer/client", url.Values{"action": {"skip"}}), 303, "/installer/admin", "")

			if variables, texts := counts(t, i); variables != 0 || texts != 0 {
				t.Errorf("the database holds %d variables and %d texts, want none", variables, texts)
			}
		})
	}
}

// The administrator is created: the step imports no client file by itself.
func TestCreatingTheAdministratorImportsNoClientFile(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			i, mux := form.build(t)
			clientFolder(t, bothFiles)
			toAdmin(t, mux)

			expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/", "")

			if variables, texts := counts(t, i); variables != 0 || texts != 0 {
				t.Errorf("the database holds %d variables and %d texts, want none", variables, texts)
			}
		})
	}
}

// A step is opened before the one it follows: the browser goes to the first step that waits.
func TestAStepOpenedEarlyGoesToTheFirstThatWaits(t *testing.T) {
	for _, form := range forms {
		t.Run(form.name, func(t *testing.T) {
			_, mux := form.build(t)
			expect(t, send(t, mux, "GET", "/installer/", nil), 200, "", "Next:site}")
			expect(t, send(t, mux, "GET", "/installer/client", nil), 303, "/installer/site", "")
			expect(t, send(t, mux, "POST", "/installer/client", url.Values{"action": {"skip"}}), 303, "/installer/site", "")
			expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/installer/site", "")

			toClient(t, mux)
			expect(t, send(t, mux, "GET", "/installer/", nil), 200, "", "Next:client}")
			expect(t, send(t, mux, "GET", "/installer/admin", nil), 303, "/installer/client", "")
			expect(t, send(t, mux, "POST", "/installer/admin", adminForm), 303, "/installer/client", "")
			// A step passed opens again.
			expect(t, send(t, mux, "GET", "/installer/site", nil), 200, "", "Name:Reborn Hotel")
		})
	}
}
