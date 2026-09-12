# Effective Go checklist

Source: https://go.dev/doc/effective_go — sections follow the guide's order.

How to use: read the code under review, work the items that apply, and report failures as `file:line — rule (anchor) — fix`.

## Modern Go boundary

The guide dates from 2009. For language and library idioms added since, the `use-modern-go` skill is authoritative; do not flag these as violations:

- [ ] `any` is not reported because the guide shows `interface{}`.
- [ ] `slices`/`maps` helpers are not reported because the guide writes manual loops.
- [ ] `errors.Is`/`errors.As` and `errors.AsType` are not reported because the guide compares errors with `==` or asserts types.
- [ ] `min`/`max`, `strings.Cut`, and `for range n` are not reported because the guide predates them.

## Contents

- Introduction and examples
- Formatting
- Commentary
- Names
- Semicolons
- Control structures
- Functions
- Data
- Initialization
- Methods
- Interfaces and other types
- The blank identifier
- Embedding
- Concurrency
- Errors
- A web server

## Introduction and examples

- [ ] Code is idiomatic Go, not a transliteration of another language (`#introduction`).
- [ ] The standard library docs, source, and runnable examples were consulted where behavior was unclear (`#examples`).

## Formatting

- [ ] Code is `gofmt`-clean (`go fmt` for a package) (`#formatting`).
- [ ] Style problems are fixed by rearranging code, not by working around the formatter.
- [ ] Columns and comments are not manually aligned.
- [ ] Tabs indent; spaces appear only where unavoidable.
- [ ] Long lines are wrapped and continuation is indented with one extra tab.
- [ ] Control structures have no parentheses.
- [ ] Precedence is trusted (`x<<8 + y<<16` means what the spacing implies).

## Commentary

- [ ] `//` is used normally; `/* */` only for package comments, expressions, or disabled code (`#commentary`).
- [ ] Doc comments sit directly before the declaration with no blank line.
- [ ] Doc comments are the primary documentation for top-level declarations.
- [ ] Doc comments start with the declared name and are complete sentences.

## Names

- [ ] Visibility is controlled by capitalization alone (`#names`).

### Package names (`#package-names`)

- [ ] Package names are short, concise, evocative, lowercase, single-word.
- [ ] No underscores and no mixedCaps in package names.
- [ ] Package name matches the source directory base (`encoding/base64` → `base64`).
- [ ] Exported names do not repeat the package name (`bufio.Reader`, `ring.New`).
- [ ] `import .` is not used outside outside-package tests.
- [ ] Names are not made long for readability where a doc comment would serve (`once.Do`).

### Getters (`#Getters`)

- [ ] Getters drop the `Get` prefix (`Owner()`).
- [ ] Setters use `SetOwner()`.
- [ ] Capitalization is relied on to separate the exported method from the unexported field.

### Interface names (`#interface-names`)

- [ ] One-method interfaces use the method name plus `-er` (`Reader`, `Writer`, `Formatter`, `CloseNotifier`).
- [ ] Canonical names and signatures (`Read`, `Write`, `Close`, `Flush`, `String`) are honored.
- [ ] A string converter is `String`, not `ToString`.

### MixedCaps (`#mixed-caps`)

- [ ] Multiword names use `MixedCaps`/`mixedCaps`, never underscores.

## Semicolons

- [ ] No line ends in an identifier, literal, or `break continue fallthrough return ++ -- ) }` when a semicolon would change meaning (`#semicolons`).
- [ ] Semicolons appear only in `for` clauses or between statements on one line.
- [ ] Semicolons are omitted before a closing brace.
- [ ] Opening braces for `if`/`for`/`switch`/`select` are on the same line:

  ```go
  if i < f() { // right
      g()
  }

  if i < f()  // wrong!
  {           // wrong!
      g()
  }
  ```

## Control structures

- [ ] No `do`/`while` is simulated; the generalized `for` is used (`#control-structures`).
- [ ] `if`/`switch` use init statements where they scope variables.
- [ ] Labeled `break`/`continue` are used where they clarify intent.
- [ ] Conditions have no parentheses.
- [ ] Every body is brace-delimited.

### If (`#if`)

- [ ] `if` bodies are brace-delimited and written on multiple lines.
- [ ] Variables only needed for the condition are declared in the init statement:

  ```go
  if err := file.Chmod(0664); err != nil {
      log.Print(err)
      return err
  }
  ```

- [ ] `else` is omitted when the body ends in `break`, `continue`, `goto`, or `return`.
- [ ] The success path runs down the page and error cases are eliminated as they arise.

### Redeclaration and reassignment (`#redeclaration`)

- [ ] `:=` reuses an existing variable only when it is in the same scope.
- [ ] `:=` reuse has an assignable value and at least one new variable.
- [ ] Shadowing in an outer scope is intentional (it creates a new variable).
- [ ] Parameters and named results are treated as sharing the body's scope.

### For (`#for`)

- [ ] The right form is used: `for init; cond; post {}`, `for cond {}`, or `for {}`.
- [ ] `range` is used for arrays, slices, strings, maps, and channels.
- [ ] Unused range keys/values are discarded with `_`.
- [ ] String ranges handle per-rune decoding.
- [ ] Invalid UTF-8 in string ranges is handled as U+FFFD.
- [ ] `++`/`--` are treated as statements, not expressions.
- [ ] Multi-variable loops use parallel assignment:

  ```go
  for i, j := 0, len(a)-1; i < j; i, j = i+1, j-1 {
      a[i], a[j] = a[j], a[i]
  }
  ```

### Switch (`#switch`)

- [ ] Cases may be non-constant and non-integer.
- [ ] Cases are ordered for top-to-bottom evaluation.
- [ ] An expressionless `switch` is used in place of long `if`-`else` chains.
- [ ] No automatic fallthrough is assumed.
- [ ] Comma-separated cases group values.
- [ ] Labeled `break` is used to leave a surrounding loop.
- [ ] `continue` labels, where used, target loops only.

### Type switch (`#type_switch`)

- [ ] The dynamic type is discovered with `switch t := t.(type)`.
- [ ] The clause variable is used with the case's type:

  ```go
  switch t := t.(type) {
  case bool:
      fmt.Printf("boolean %t\n", t)
  case int:
      fmt.Printf("integer %d\n", t)
  default:
      fmt.Printf("unexpected type %T\n", t)
  }
  ```

- [ ] `default` handles the unexpected type.

## Functions

### Multiple return values (`#multiple-returns`)

- [ ] Results are returned with an error instead of in-band error values (`func (file *File) Write(b []byte) (n int, err error)`).
- [ ] Output parameters are replaced by returned values.
- [ ] Callers consume multiple returns directly (`x, i = nextInt(b, i)`).

### Named result parameters (`#named-results`)

- [ ] Named results are initialized to zero and behave as ordinary variables.
- [ ] A bare `return` is used only with named results.
- [ ] Names are used when they document otherwise-ambiguous results (`(value, nextPos int)`).
- [ ] Bare returns are limited to cases that benefit (accumulation, `defer` mutation).

### Defer (`#defer`)

- [ ] Unlock/close is deferred next to the acquisition.
- [ ] Defer is used to cover every return path.
- [ ] Argument and receiver evaluation at `defer` time is intentional.
- [ ] LIFO execution order is accounted for.
- [ ] `defer` is treated as function-based, not block-based.
- [ ] Deferred calls inside loops are intentional.

## Data

### Allocation with `new` (`#allocation_new`)

- [ ] `new` is used when a zeroed `*T` is wanted.
- [ ] `new(expr)` is recognized as available since Go 1.26 for an initial value.
- [ ] Zero values are designed to be useful (`bytes.Buffer`, `sync.Mutex`).
- [ ] Zero-value usefulness is relied on transitively through structs.

### Constructors and composite literals (`#composite_literals`)

- [ ] Constructors return `&T{...}` composite literals.
- [ ] `new` plus field assignments is not used where a literal works:

  ```go
  func NewFile(fd int, name string) *File {
      if fd < 0 {
          return nil
      }
      return &File{fd, name, nil, 0}
  }
  ```

- [ ] Returning the address of a local is relied on safely.
- [ ] Each `&T{...}` evaluation is understood to allocate a fresh instance.
- [ ] Labeled elements are used (any order; omitted fields stay zero).
- [ ] `new(T)` and `&T{}` are treated as equivalent.
- [ ] Array, slice, and map literals use index or key labels where they clarify (`map[int]string{Enone: "no error"}`).

### Allocation with `make` (`#allocation_make`)

- [ ] `make` is used only for slices, maps, and channels.
- [ ] `make` is understood to return an initialized `T`, never `*T`.
- [ ] Slice length and capacity are chosen deliberately (`make([]int, 10, 100)`).
- [ ] `new([]int)` is not used for slices.
- [ ] `v := make([]int, 100)` is preferred over pointer-then-slice allocation.

### Arrays (`#arrays`)

- [ ] Arrays are treated as values (assignment and calls copy all elements).
- [ ] Array length is treated as part of the type (`[10]int` ≠ `[20]int`).
- [ ] Pointer-to-array parameters (`Sum(&array)`) appear only for deliberate C-style sharing.
- [ ] Slices are preferred over arrays otherwise.

### Slices (`#slices`)

- [ ] Shared-backing semantics are respected (assigning/passing shares the array).
- [ ] Element changes through a passed slice are understood to be visible to the caller.
- [ ] Reads are bounded by slicing (`f.Read(buf[0:32])`).
- [ ] Length is changed only by reslicing within capacity.
- [ ] `cap` is used to know the reslice limit.
- [ ] Custom append logic reallocates, copies, and returns the new slice.
- [ ] It is understood that the slice descriptor is passed by value.

### Two-dimensional slices (`#two_dimensional_slices`)

- [ ] 2D data uses slices-of-slices or arrays-of-arrays.
- [ ] Independent inner lengths are handled.
- [ ] Rows are allocated independently when they may grow.
- [ ] A single flat allocation is sliced into rows when they won't.

### Maps (`#maps`)

- [ ] Keys are equality-comparable.
- [ ] Slices are not used as keys.
- [ ] Reference semantics are respected.
- [ ] Missing keys are expected to return the zero value.
- [ ] Comma-ok distinguishes a missing key from a zero value (`seconds, ok := timeZone[tz]`).
- [ ] `_` is used when only presence matters.
- [ ] Sets use `map[T]bool`.
- [ ] `delete` is relied on as safe when the key is absent.

### Printing (`#printing`)

- [ ] The right `fmt` family is used (`Printf`/`Fprintf`/`Sprintf`, `Print`/`Println`).
- [ ] `Fprint` targets an `io.Writer`.
- [ ] Formats are type-driven; no signedness/size flags are added.
- [ ] `%v` is used as the catchall.
- [ ] `%+v` and `%#v` are used for fields and Go syntax.
- [ ] `%q`, `%#q`, `%x`, `% x`, and `%T` are used correctly.
- [ ] Map iteration order is never relied on (printing sorts by key).
- [ ] `String() string` is implemented for canonical output.
- [ ] `String()` is reentrant and never recurses (convert first or use a non-string verb such as `%f`).
- [ ] Variadic arguments and slice pass-through use `...` correctly.
- [ ] Typed variadics (`...int`) are used where appropriate.

### Append (`#append`)

- [ ] The result of `append` is always assigned (`x = append(x, 4, 5, 6)`).
- [ ] Slice appends use `...` (`x = append(x, y...)`).
- [ ] Omitting `...` is recognized as a type error.

## Initialization

- [ ] Initialization order across declarations and packages is not hand-ordered (`#initialization`).

### Constants (`#constants`)

- [ ] Constants are compile-time constant expressions (`1<<3`, not `math.Sin(math.Pi/4)`).
- [ ] `iota` builds enumerations, skipping an invalid zero:

  ```go
  const (
      _           = iota
      KB ByteSize = 1 << (10 * iota)
      MB
      GB
  )
  ```

- [ ] `String` methods on scalar types (`ByteSize`) are used for automatic formatting.
- [ ] Recursion in scalar `String` methods is avoided by using a non-string verb.

### Variables (`#variables`)

- [ ] Runtime initialization is used where appropriate.
- [ ] `var (...)` groups are used for related package-level variables.

### The init function (`#init`)

- [ ] `init` is used only for state declarations cannot express.
- [ ] `init` is used to verify or repair state before execution.
- [ ] The order is respected: variable initializers run before `init`.
- [ ] Imported packages initialize first.
- [ ] Multiple `init` functions per file are intentional.

## Methods

### Pointers vs. Values (`#pointers_vs_values`)

- [ ] The receiver is a named type (not a pointer or interface).
- [ ] Value receivers are used for copies; pointer receivers for mutation.
- [ ] The calling rule is respected: value methods work on values and pointers.
- [ ] Pointer methods require pointers or addressable values (implicit `&`).
- [ ] Receivers are consistent within a type.
- [ ] Types such as `*ByteSlice` are allowed to satisfy `io.Writer`.

## Interfaces and other types

### Interfaces (`#interfaces`)

- [ ] Interfaces specify behavior, not data.
- [ ] Interfaces stay small; one or two methods are preferred.
- [ ] Interface names derive from the method (`io.Writer`).
- [ ] Multiple interface satisfaction is handled deliberately.
- [ ] Copies are made before mutating (`Sequence.Copy`).
- [ ] O(N²) string building is avoided.

### Conversions (`#conversions`)

- [ ] Same-representation conversions are used to access a different method set (`fmt.Sprint([]int(s))`).
- [ ] Conversions that allocate are distinguished from those that don't.
- [ ] Existing types (`sort.IntSlice(s).Sort()`) are reused instead of reimplementing interfaces.

### Interface conversions and type assertions (`#interface_conversions`)

- [ ] Type switches convert an interface to each case's type.
- [ ] Type assertions extract a single explicit type.
- [ ] Comma-ok guards assertions that may fail.
- [ ] Zero-value-on-failure behavior is understood.
- [ ] Assertion chains in `if`-`else` are recognized as alternatives to a type switch.

### Generality (`#generality`)

- [ ] A type that exists only to implement an interface is not exported.
- [ ] The interface is exported instead of the implementing type.
- [ ] Constructors return the interface (`crc32.NewIEEE`, `adler32.New`, `NewCTR`).
- [ ] Implementation swaps are localized to constructor calls.

### Interfaces and methods (`#interface_methods`)

- [ ] Any type may carry methods (`Counter` as struct or `int`).
- [ ] The smallest useful receiver type is chosen.
- [ ] Function adapters (`http.HandlerFunc(ArgServer)`) turn functions into interface implementations.
- [ ] Interfaces are treated as sets of methods, definable for almost any type.

## The blank identifier

### The blank identifier in multiple assignment (`#blank_assign`)

- [ ] `_` discards only values that are genuinely unused (`if _, err := os.Stat(path); os.IsNotExist(err)`).
- [ ] Errors are never discarded (`fi, _ := os.Stat(path)` before `fi.IsDir()` is recognized as a crash).
- [ ] Discarding an error to ignore it is treated as a defect.

### Unused imports and variables (`#blank_unused`)

- [ ] No unused imports ship.
- [ ] No unused variables ship.
- [ ] Development silencing uses blank assignments (`var _ = fmt.Printf`, `_ = fd`).
- [ ] Silent blank assignments are commented for cleanup.
- [ ] Silent blank assignments sit right after the imports.

### Import for side effect (`#blank_import`)

- [ ] Side-effect imports are written `import _ "net/http/pprof"`.
- [ ] The blank name is understood to document intent (no other use possible).

### Interface checks (`#blank_implements`)

- [ ] Runtime checks use assertions (`if _, ok := val.(json.Marshaler); ok`).
- [ ] Compile-time guarantees use `var _ json.Marshaler = (*RawMessage)(nil)`.
- [ ] The compile-time form is used only when no static conversion already proves the interface.

## Embedding

- [ ] Interface embedding forms unions (`io.ReadWriter` embeds `Reader` and `Writer`) (`#embedding`).
- [ ] Only interfaces embed interfaces.
- [ ] Struct embedding promotes methods without forwarding wrappers (`bufio.ReadWriter`).
- [ ] Promoted methods are understood to run with the inner receiver.
- [ ] Embedded structs satisfy the interfaces of their inner types.
- [ ] Convenience embedding is used where it removes boilerplate (`Job{Command string; *log.Logger}`).
- [ ] Embedded fields are initialized via constructor or literal.
- [ ] Embedded fields are reached by the bare type name (`job.Logger`).
- [ ] Overrides of promoted methods are deliberate.
- [ ] Conflict rules are respected: outer names hide deeper ones.
- [ ] Same-level duplicate names are errors unless never referenced outside the type definition.

## Concurrency

### Share by communicating (`#sharing`)

- [ ] Shared values travel over channels.
- [ ] Only one goroutine holds a value at a time.
- [ ] Mutexes are used only where they genuinely fit (for example, guarding a reference count).

### Goroutines (`#goroutines`)

- [ ] Goroutines are treated as cheap and stack-growing.
- [ ] Multiplexing onto OS threads is understood.
- [ ] `go` invocations signal completion through a channel.
- [ ] Goroutines have a bounded lifetime.
- [ ] Closures capture variables deliberately.

### Channels (`#channels`)

- [ ] Channels are created with `make`.
- [ ] Buffer size is chosen deliberately.
- [ ] Unbuffered channels are understood to combine communication and synchronization.
- [ ] Receivers are expected to block until data arrives.
- [ ] Senders are expected to block until a receiver (unbuffered) or buffer space.
- [ ] Completion is signaled by sending (`c <- 1`).
- [ ] Waiting is done by receiving (`<-c`).
- [ ] Buffered channels are used as semaphores (`sem <- 1`, `<-sem`).
- [ ] Worker creation is gated so bursts cannot spawn unbounded goroutines.
- [ ] A fixed worker pool plus a `quit` channel is used where appropriate.
- [ ] Loop variables captured by goroutines are passed or copied when targeting pre-1.22 semantics.

### Channels of channels (`#chan_of_chan`)

- [ ] Request/response handoffs put a reply channel in the request (`resultChan`).
- [ ] Reply channels replace shared state and mutexes.

### Parallelization (`#parallel`)

- [ ] Independent work is split into pieces.
- [ ] One goroutine per piece is launched.
- [ ] Completion signals are drained.
- [ ] `runtime.NumCPU()` / `runtime.GOMAXPROCS(0)` are used instead of hardcoded core counts.
- [ ] Concurrency and parallelism are not conflated.

### A leaky buffer (`#leaky_buffer`)

- [ ] Non-blocking `select`/`default` is used to take or return buffers.
- [ ] A full free list drops buffers to the GC.

## Errors

- [ ] Errors are returned as a separate value, not printed and ignored (`#errors`).
- [ ] A returned error is checked before other results are used.
- [ ] Error strings are lowercase.
- [ ] Error strings have no trailing punctuation.
- [ ] Error strings identify their origin (`"image: unknown format"`).
- [ ] Detailed error types (`*os.PathError`) are used to carry operation and path.
- [ ] Sentinel and typed errors are matched with `errors.Is`/`errors.As`, not string comparison (use-modern-go).
- [ ] Type assertions/switches inspect errors only where `errors.Is`/`errors.As` cannot express the query.
- [ ] Error values are not shared and mutated across calls.

### Panic (`#panic`)

- [ ] `panic` is reserved for unrecoverable situations.
- [ ] Library code avoids `panic`.
- [ ] A panic during `init` is used only when setup truly cannot proceed.

### Recover (`#recover`)

- [ ] `recover` is called directly from a deferred function.
- [ ] `recover` is used to isolate a failing goroutine (`safelyDo`).
- [ ] Unexpected panics re-panic.
- [ ] Named results are cleared or set during recovery where needed.
- [ ] Deferred functions that modify named return values are intentional.
- [ ] The panic/recover pattern stays package-internal.
- [ ] Internal panics are converted to errors at the package boundary.

## A web server

- [ ] Servers follow the QR example: `flag` for the address (`#web_server`).
- [ ] A package-level template is built with `template.Must`.
- [ ] Handlers are bound with `http.Handle("/", http.HandlerFunc(QR))`.
- [ ] The server uses `http.ListenAndServe`.
- [ ] Handlers execute templates with form data (`templ.Execute(w, req.FormValue("s"))`).
- [ ] Templates use `{{if .}}`/`{{end}}`/`{{.}}` actions.
- [ ] `html/template` auto-escaping is relied on.
