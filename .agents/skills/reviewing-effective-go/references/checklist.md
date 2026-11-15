# Effective Go checklist

Source: https://go.dev/doc/effective_go. The sections follow the guide's order. Each item is what good code does.

## Contents

- Modern Go boundary
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

## Modern Go boundary

The guide dates from 2009. The `use-modern-go` skill owns the idioms added since; these are correct code:

- [ ] `any` and type parameters stand where the guide shows `interface{}`.
- [ ] `slices` and `maps` helpers (`slices.SortFunc`, `slices.Contains`) stand where the guide writes loops.
- [ ] `errors.Is`, `errors.As` and `errors.AsType` stand where the guide compares errors with `==` or asserts types.
- [ ] `min`, `max`, `strings.Cut` and `for range n` stand where the guide writes them out.

## Introduction and examples

- [ ] Code is idiomatic Go, written for Go in place of a transliteration of another language (`#introduction`).
- [ ] Unclear behaviour is settled from the standard library docs, source and runnable examples (`#examples`).

## Formatting

- [ ] Code is `gofmt`-clean (`go fmt` for a package) (`#formatting`).
- [ ] Style problems are fixed by rearranging code, with the formatter left as it is.
- [ ] Columns and comments keep the alignment `gofmt` gives them.
- [ ] Tabs indent; spaces appear only where they must.
- [ ] Long lines are wrapped, and the continuation is indented with one extra tab.
- [ ] Control structures go without parentheses.
- [ ] Spacing shows precedence, and code trusts it (`x<<8 + y<<16`).

## Commentary

- [ ] `//` comments are the norm; `/* */` serves package comments, expressions and disabled code (`#commentary`).
- [ ] A doc comment sits on the lines directly above its declaration.
- [ ] Doc comments are the primary documentation of top-level declarations.
- [ ] A doc comment starts with the declared name and is made of complete sentences.

## Names

- [ ] Capitalization alone sets visibility (`#names`).

### Package names (`#package-names`)

- [ ] Package names are short, concise, evocative, lowercase and one word.
- [ ] Package names are plain lowercase, free of underscores and mixedCaps.
- [ ] The package name is the base of its source directory (`encoding/base64` → `base64`).
- [ ] Exported names read well after the package name, without repeating it (`bufio.Reader`, `ring.New`).
- [ ] `import .` appears only in tests that run outside the package they test.
- [ ] Names stay short, with a doc comment carrying the detail (`once.Do`).

### Getters (`#Getters`)

- [ ] A getter is named after its field, without a `Get` prefix (`Owner()`).
- [ ] A setter is `SetOwner()`.
- [ ] Capitalization separates the exported method from the unexported field.

### Interface names (`#interface-names`)

- [ ] A one-method interface is named for its method plus `-er` (`Reader`, `Writer`, `Formatter`, `CloseNotifier`).
- [ ] A method called `Read`, `Write`, `Close`, `Flush` or `String` has the canonical signature and meaning.
- [ ] A string converter is `String`, in place of `ToString`.

### MixedCaps (`#mixed-caps`)

- [ ] Multiword names use `MixedCaps` or `mixedCaps`.

## Semicolons

- [ ] Line breaks fall where an inserted semicolon keeps the meaning: after an identifier, a literal or
      `break continue fallthrough return ++ -- ) }` only when the statement ends there (`#semicolons`).
- [ ] Semicolons appear only in `for` clauses and between statements on one line.
- [ ] A closing brace follows a statement directly, with the semicolon left out.
- [ ] The opening brace of `if`, `for`, `switch` and `select` sits on the same line:

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

- [ ] Loops use the generalized `for`, in place of a simulated `do` or `while` (`#control-structures`).
- [ ] `if` and `switch` use an init statement where it scopes a variable.
- [ ] Labeled `break` and `continue` appear where they make the intent clear.
- [ ] Conditions go without parentheses.
- [ ] Every body is brace-delimited.

### If (`#if`)

- [ ] An `if` body is brace-delimited and written on its own lines.
- [ ] A variable needed only by the condition is declared in the init statement:

  ```go
  if err := file.Chmod(0664); err != nil {
      log.Print(err)
      return err
  }
  ```

- [ ] When the body ends in `break`, `continue`, `goto` or `return`, the `else` is left out.
- [ ] The success path runs down the page, and each error case returns as it arises.

### Redeclaration and reassignment (`#redeclaration`)

- [ ] `:=` reuses an existing variable only when it was declared in the same scope.
- [ ] A `:=` that reuses a variable assigns a value of its type and declares at least one new variable.
- [ ] A `:=` in an inner scope that shadows an outer variable is intentional, since it creates a new variable.
- [ ] Code treats parameters and named results as part of the body's scope.

### For (`#for`)

- [ ] Each loop uses the fitting form: `for init; cond; post {}`, `for cond {}` or `for {}`.
- [ ] `range` loops over arrays, slices, strings, maps and channels.
- [ ] Unused range keys and values are discarded with `_`.
- [ ] A `range` over a string works on runes.
- [ ] A `range` over a string handles invalid UTF-8 as U+FFFD.
- [ ] `++` and `--` stand as statements.
- [ ] A loop over several variables uses parallel assignment:

  ```go
  for i, j := 0, len(a)-1; i < j; i, j = i+1, j-1 {
      a[i], a[j] = a[j], a[i]
  }
  ```

### Switch (`#switch`)

- [ ] Cases use the expressions the logic needs: constants, variables, strings or any comparable type.
- [ ] Cases are ordered for top-to-bottom evaluation.
- [ ] An expressionless `switch` replaces a long `if`-`else` chain.
- [ ] Each case stands alone; `fallthrough` is written where it is meant.
- [ ] Values that share a case are grouped with commas.
- [ ] A labeled `break` leaves a surrounding loop.
- [ ] A `continue` label targets a loop.

### Type switch (`#type_switch`)

- [ ] `switch t := t.(type)` discovers the dynamic type.
- [ ] Each clause uses the variable with the case's type:

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

- [ ] A function returns its result and an error, in place of an in-band error value
      (`func (file *File) Write(b []byte) (n int, err error)`).
- [ ] Results come back as return values, in place of output parameters.
- [ ] Callers take multiple results directly (`x, i = nextInt(b, i)`).

### Named result parameters (`#named-results`)

- [ ] Code relies on named results starting at zero and acting as ordinary variables.
- [ ] A bare `return` appears only with named results.
- [ ] Results are named where the names document them (`(value, nextPos int)`).
- [ ] Bare returns appear only where they help: accumulation, or a `defer` that changes a result.

### Defer (`#defer`)

- [ ] An unlock or close is deferred right after the acquisition.
- [ ] `defer` covers every return path.
- [ ] Arguments and receivers are evaluated when `defer` runs, and the code means it.
- [ ] Code allows for deferred calls running last in, first out.
- [ ] Code expects deferred calls to run when the function returns, at the end of the function rather than the block.
- [ ] A `defer` inside a loop is intentional.

## Data

### Allocation with `new` (`#allocation_new`)

- [ ] `new` gives a zeroed `*T`.
- [ ] `new(expr)` gives a pointer to an initial value, from Go 1.26.
- [ ] Types are designed so their zero value is useful (`bytes.Buffer`, `sync.Mutex`).
- [ ] Structs rely on the useful zero values of their fields.

### Constructors and composite literals (`#composite_literals`)

- [ ] Constructors return a `&T{...}` composite literal.
- [ ] A composite literal replaces `new` followed by field assignments:

  ```go
  func NewFile(fd int, name string) *File {
      if fd < 0 {
          return nil
      }
      return &File{fd, name, nil, 0}
  }
  ```

- [ ] Returning the address of a local variable is safe, and code relies on it.
- [ ] Code expects each evaluation of `&T{...}` to allocate a fresh instance.
- [ ] Literals label their fields; the order is free and omitted fields are zero.
- [ ] `new(T)` and `&T{}` are used as equals.
- [ ] Array, slice and map literals label their indices or keys where it helps (`map[int]string{Enone: "no error"}`).

### Allocation with `make` (`#allocation_make`)

- [ ] `make` creates slices, maps and channels only.
- [ ] Code uses the initialized `T` that `make` returns, as a value.
- [ ] Slice length and capacity are chosen on purpose (`make([]int, 10, 100)`).
- [ ] Slices come from `make`, in place of `new([]int)`.
- [ ] `v := make([]int, 100)` replaces allocating a pointer and then the slice.

### Arrays (`#arrays`)

- [ ] Code treats arrays as values: assignment and calls copy every element.
- [ ] Code treats the length as part of the array's type (`[10]int` and `[20]int` differ).
- [ ] A pointer-to-array parameter (`Sum(&array)`) appears only for deliberate C-style sharing.
- [ ] Slices serve every other case.

### Slices (`#slices`)

- [ ] Code respects shared backing arrays: assigning or passing a slice shares the array.
- [ ] Code expects element changes through a passed slice to reach the caller.
- [ ] Reads are bounded by slicing (`f.Read(buf[0:32])`).
- [ ] Length changes by reslicing within the capacity.
- [ ] `cap` gives the reslice limit.
- [ ] Custom append logic reallocates, copies and returns the new slice.
- [ ] Code treats the slice header as passed by value.

### Two-dimensional slices (`#two_dimensional_slices`)

- [ ] Two-dimensional data uses slices of slices or arrays of arrays.
- [ ] Code handles inner slices of different lengths.
- [ ] Rows that may grow are allocated one by one.
- [ ] Rows of fixed size are sliced from one flat allocation.

### Maps (`#maps`)

- [ ] Map keys are types with equality.
- [ ] Keys are comparable types, in place of slices.
- [ ] Code treats maps as references: a passed map shares its entries.
- [ ] Code expects a missing key to give the zero value.
- [ ] Comma-ok tells a missing key from a zero value (`seconds, ok := timeZone[tz]`).
- [ ] `_` takes the value when only presence matters.
- [ ] Sets are `map[T]bool`.
- [ ] Code calls `delete` freely, since it is safe on an absent key.

### Printing (`#printing`)

- [ ] Each call uses the fitting `fmt` family (`Printf`/`Fprintf`/`Sprintf`, `Print`/`Println`).
- [ ] `Fprint` writes to an `io.Writer`.
- [ ] Formats follow the argument's type, with signedness and size flags left out.
- [ ] `%v` serves as the catchall.
- [ ] `%+v` shows field names and `%#v` shows Go syntax.
- [ ] `%q`, `%#q`, `%x`, `% x` and `%T` are used for what they print.
- [ ] Output stays correct whatever the map iteration order (printing sorts by key).
- [ ] Types with a canonical output implement `String() string`.
- [ ] `String()` is reentrant and free of recursion: it converts first or uses a non-string verb such as `%f`.
- [ ] Variadic arguments and slices passed through use `...` correctly.
- [ ] Typed variadics (`...int`) appear where they fit.

### Append (`#append`)

- [ ] Every `append` result is assigned (`x = append(x, 4, 5, 6)`).
- [ ] Appending a slice uses `...` (`x = append(x, y...)`).
- [ ] Code expects `append(x, y)` with a slice `y` to be a type error.

## Initialization

- [ ] Code relies on Go to order initialization across declarations and packages (`#initialization`).

### Constants (`#constants`)

- [ ] Constants are compile-time constant expressions (`1<<3`, in place of `math.Sin(math.Pi/4)`).
- [ ] `iota` builds enumerations and skips an invalid zero:

  ```go
  const (
      _           = iota
      KB ByteSize = 1 << (10 * iota)
      MB
      GB
  )
  ```

- [ ] Scalar types such as `ByteSize` format themselves with a `String` method.
- [ ] A scalar `String` method uses a non-string verb, so it stays free of recursion.

### Variables (`#variables`)

- [ ] Variables are initialized at run time where they need computed values.
- [ ] Related package-level variables are grouped in `var (...)`.

### The init function (`#init`)

- [ ] `init` sets up only the state a declaration is unable to express.
- [ ] `init` verifies or repairs state before execution begins.
- [ ] Code relies on variable initializers running before `init`.
- [ ] Code relies on imported packages initializing first.
- [ ] Several `init` functions in one file are intentional.

## Methods

### Pointers vs. Values (`#pointers_vs_values`)

- [ ] The receiver's base is a named type, other than a pointer or an interface.
- [ ] Value receivers work on copies; pointer receivers mutate.
- [ ] Code calls value methods on values and pointers alike.
- [ ] Pointer methods are called on pointers or addressable values (Go adds the `&`).
- [ ] The receivers of one type are consistent.
- [ ] Types such as `*ByteSlice` satisfy `io.Writer` through pointer methods.

## Interfaces and other types

### Interfaces (`#interfaces`)

- [ ] Interfaces specify behaviour, in place of data.
- [ ] Interfaces stay small: one or two methods.
- [ ] Interface names come from their method (`io.Writer`).
- [ ] A type that satisfies several interfaces does so on purpose.
- [ ] Code copies a value before mutating it (`Sequence.Copy`).
- [ ] String building runs in linear time, in place of O(N²) concatenation.

### Conversions (`#conversions`)

- [ ] Conversions between types of the same representation reach a different method set (`fmt.Sprint([]int(s))`).
- [ ] Code tells conversions that allocate from those that reuse the value.
- [ ] Existing types are reused (`sort.IntSlice(s).Sort()`) in place of a new interface implementation.

### Interface conversions and type assertions (`#interface_conversions`)

- [ ] Type switches convert an interface to each case's type.
- [ ] A type assertion extracts one explicit type.
- [ ] Comma-ok guards each assertion that may fail.
- [ ] Code expects a failed comma-ok assertion to give the zero value.
- [ ] A chain of assertions in `if`-`else` is a deliberate alternative to a type switch.

### Generality (`#generality`)

- [ ] A type that exists only to implement an interface stays unexported.
- [ ] The interface is exported in place of the implementing type.
- [ ] Constructors return the interface (`crc32.NewIEEE`, `adler32.New`, `NewCTR`).
- [ ] Swapping the implementation changes only the constructor calls.

### Interfaces and methods (`#interface_methods`)

- [ ] Any named type carries methods where it helps (`Counter` as a struct or an `int`).
- [ ] The receiver is the smallest useful type.
- [ ] Function adapters (`http.HandlerFunc(ArgServer)`) turn functions into interface implementations.
- [ ] Code treats an interface as a set of methods that almost any type can define.

## The blank identifier

### The blank identifier in multiple assignment (`#blank_assign`)

- [ ] `_` takes only values that are truly unused (`if _, err := os.Stat(path); os.IsNotExist(err)`).
- [ ] Every error is kept and checked (`fi, _ := os.Stat(path)` before `fi.IsDir()` crashes).
- [ ] An error is handled or returned, in place of discarded.

### Unused imports and variables (`#blank_unused`)

- [ ] Every import is used.
- [ ] Every variable is used.
- [ ] Silencing during development uses blank assignments (`var _ = fmt.Printf`, `_ = fd`).
- [ ] Each silencing blank assignment carries a comment to remove it.
- [ ] Silencing blank assignments sit right after the imports.

### Import for side effect (`#blank_import`)

- [ ] A side-effect import is written `import _ "net/http/pprof"`.
- [ ] The blank name documents that the import serves its side effect alone.

### Interface checks (`#blank_implements`)

- [ ] Runtime checks use assertions (`if _, ok := val.(json.Marshaler); ok`).
- [ ] Compile-time guarantees use `var _ json.Marshaler = (*RawMessage)(nil)`.
- [ ] The compile-time form appears only where the code lacks a static conversion that proves the interface.

## Embedding

- [ ] Interface embedding forms unions (`io.ReadWriter` embeds `Reader` and `Writer`) (`#embedding`).
- [ ] Interfaces embed only interfaces.
- [ ] Struct embedding promotes methods, in place of forwarding wrappers (`bufio.ReadWriter`).
- [ ] Code expects promoted methods to run with the inner receiver.
- [ ] Structs satisfy the interfaces of their embedded types through promotion.
- [ ] Embedding is used for convenience where it removes boilerplate (`Job{Command string; *log.Logger}`).
- [ ] Embedded fields are initialized by a constructor or a literal.
- [ ] Embedded fields are reached by the bare type name (`job.Logger`).
- [ ] An override of a promoted method is deliberate.
- [ ] Code respects the conflict rule: an outer name hides deeper ones.
- [ ] Duplicate names at the same level are referenced only inside the type definition.

## Concurrency

### Share by communicating (`#sharing`)

- [ ] Shared values travel over channels.
- [ ] One goroutine holds a value at a time.
- [ ] Mutexes appear only where they fit best, such as guarding a reference count.

### Goroutines (`#goroutines`)

- [ ] Goroutines are used freely, since they are cheap and grow their stacks.
- [ ] Code relies on the runtime multiplexing goroutines onto OS threads.
- [ ] A `go` statement signals completion through a channel.
- [ ] Each goroutine has a bounded lifetime.
- [ ] Closures capture variables on purpose.

### Channels (`#channels`)

- [ ] Channels are created with `make`.
- [ ] The buffer size is chosen on purpose.
- [ ] Unbuffered channels serve to communicate and to synchronize at once.
- [ ] Code expects a receiver to block until data arrives.
- [ ] Code expects a sender to block until a receiver takes the value (unbuffered) or the buffer has room.
- [ ] Completion is signalled by a send (`c <- 1`).
- [ ] Waiting is a receive (`<-c`).
- [ ] Buffered channels serve as semaphores (`sem <- 1`, `<-sem`).
- [ ] Worker creation is gated, so a burst spawns a bounded number of goroutines.
- [ ] A fixed worker pool with a `quit` channel serves where it fits.
- [ ] Code targeting pre-1.22 semantics passes or copies the loop variables its goroutines capture.

### Channels of channels (`#chan_of_chan`)

- [ ] A request/response handoff carries a reply channel in the request (`resultChan`).
- [ ] Reply channels replace shared state and mutexes.

### Parallelization (`#parallel`)

- [ ] Independent work is split into pieces.
- [ ] One goroutine runs each piece.
- [ ] Every completion signal is drained.
- [ ] `runtime.NumCPU()` or `runtime.GOMAXPROCS(0)` gives the core count, in place of a hard-coded number.
- [ ] Code keeps concurrency and parallelism apart as ideas.

### A leaky buffer (`#leaky_buffer`)

- [ ] A `select` with `default` takes or returns buffers without blocking.
- [ ] A full free list leaves the buffer to the garbage collector.

## Errors

- [ ] Errors come back as a separate return value, in place of being printed and dropped (`#errors`).
- [ ] A returned error is checked before the other results are used.
- [ ] Error strings are lowercase.
- [ ] Error strings end without punctuation.
- [ ] Error strings name their origin (`"image: unknown format"`).
- [ ] Detailed error types (`*os.PathError`) carry the operation and the path.
- [ ] Sentinel and typed errors are matched with `errors.Is` and `errors.As`, in place of string comparison
      (`use-modern-go`).
- [ ] Type assertions and switches inspect an error only where `errors.Is` and `errors.As` fall short.
- [ ] Each call gets its own error value, with shared values left unmutated.

### Panic (`#panic`)

- [ ] `panic` is kept for unrecoverable situations.
- [ ] Library code returns errors in place of panicking.
- [ ] A panic during `init` happens only when setup is unable to proceed.

### Recover (`#recover`)

- [ ] `recover` is called directly from a deferred function.
- [ ] `recover` isolates a failing goroutine (`safelyDo`).
- [ ] An unexpected panic is re-panicked.
- [ ] Recovery clears or sets the named results where needed.
- [ ] A deferred function that changes named results is intentional.
- [ ] The panic/recover pattern stays inside the package.
- [ ] Internal panics turn into errors at the package boundary.

## A web server

- [ ] A server follows the QR example: `flag` gives the address (`#web_server`).
- [ ] A package-level template is built with `template.Must`.
- [ ] Handlers are bound with `http.Handle("/", http.HandlerFunc(QR))`.
- [ ] The server runs with `http.ListenAndServe`.
- [ ] Handlers execute templates with form data (`templ.Execute(w, req.FormValue("s"))`).
- [ ] Templates use the `{{if .}}`, `{{end}}` and `{{.}}` actions.
- [ ] Code relies on `html/template` auto-escaping.
