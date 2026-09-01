// @owner top
// value(stringExpression) — expression evaluation per docs (006 C7).
//
// Doc semantics (methods.txt value()): "returns the value of a string. When
// value() is called, Lingo parses through the stringExpression provided and
// returns its logical value." Expressions that Lingo cannot parse will produce
// unexpected results, but will not produce Lingo errors — the result is the
// value of the initial portion of the expression up to the first syntax error.
//
// Implemented subset (no user-handler invocation, R7): literal numbers (±),
// the constants TRUE/FALSE/VOID/EMPTY, plain-number arithmetic (+ - * / and
// parentheses), quoted strings, symbol strings ("#name"), and list-formatted
// strings ("[a, b]"). Unparseable input → leading parsable portion; a bare
// word with no numerical value → VOID. NO eval() anywhere.
import { list } from "./list.js";

const TOK_EOF = "eof";
const TOK_NUM = "num";
const TOK_STR = "str";
const TOK_SYM = "sym";
const TOK_WORD = "word";
const TOK_OP = "op";

function tokenize(input) {
  const out = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const m = /^[0-9]*\.?[0-9]+/.exec(input.slice(i));
      out.push({ type: TOK_NUM, value: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if (ch === '"') {
      const end = input.indexOf('"', i + 1);
      if (end === -1) break; // unterminated → treat rest as word below
      out.push({ type: TOK_STR, value: input.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    if (ch === "#") {
      const m = /^#[A-Za-z_][A-Za-z0-9_]*/.exec(input.slice(i));
      if (m) {
        out.push({ type: TOK_SYM, value: m[0].slice(1) });
        i += m[0].length;
        continue;
      }
    }
    if ("+-*/()[],".includes(ch)) {
      out.push({ type: TOK_OP, value: ch });
      i += 1;
      continue;
    }
    // bare word: consume until whitespace, an operator, comma, or ] or )
    const m = /^[^\s+\-*/(),\[\]]+/.exec(input.slice(i));
    if (m) {
      out.push({ type: TOK_WORD, value: m[0] });
      i += m[0].length;
      continue;
    }
    break;
  }
  out.push({ type: TOK_EOF, value: "" });
  return out;
}

class Parser {
  constructor(tokens) {
    this.t = tokens;
    this.pos = 0;
  }

  peek() {
    return this.t[this.pos];
  }

  next() {
    return this.t[this.pos++];
  }

  matchOp(op) {
    const t = this.peek();
    if (t.type === TOK_OP && t.value === op) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  // expr := term (("+"|"-") term)*
  expr() {
    let left = this.term();
    for (;;) {
      if (this.matchOp("+")) {
        const r = this.term();
        if (r === undefined) return left;
        left += r;
      } else if (this.matchOp("-")) {
        const r = this.term();
        if (r === undefined) return left;
        left -= r;
      } else {
        return left;
      }
    }
  }

  // term := factor (("*"|"/") factor)*
  term() {
    let left = this.factor();
    for (;;) {
      if (this.matchOp("*")) {
        const r = this.factor();
        if (r === undefined) return left;
        left *= r;
      } else if (this.matchOp("/")) {
        const r = this.factor();
        if (r === undefined) return left;
        left /= r;
      } else {
        return left;
      }
    }
  }

  factor() {
    const t = this.peek();
    if (t.type === TOK_OP && (t.value === "-" || t.value === "+")) {
      this.next();
      const operand = this.factor();
      if (operand === undefined || typeof operand !== "number") return undefined;
      return t.value === "-" ? -operand : operand;
    }
    if (t.type === TOK_NUM) {
      this.next();
      return t.value;
    }
    if (t.type === TOK_STR) {
      this.next();
      return t.value;
    }
    if (t.type === TOK_SYM) {
      this.next();
      return Symbol.for(t.value);
    }
    if (t.type === TOK_WORD) {
      const w = this.next().value;
      const upper = w.toUpperCase();
      if (upper === "TRUE") return true;
      if (upper === "FALSE") return false;
      if (upper === "VOID") return undefined;
      if (upper === "EMPTY") return "";
      return undefined; // any other bare word → VOID (leading-portion rule)
    }
    if (t.type === TOK_OP && t.value === "(") {
      this.next();
      const inner = this.expr();
      if (!this.matchOp(")")) return inner; // unresolvable → leading portion
      return inner;
    }
    if (t.type === TOK_OP && t.value === "[") {
      return this.listLiteral();
    }
    return undefined;
  }

  listLiteral() {
    this.next(); // consume "["
    const items = [];
    for (;;) {
      const t = this.peek();
      if (t.type === TOK_EOF || (t.type === TOK_OP && t.value === "]")) break;
      const v = this.factor();
      if (v === undefined) break;
      items.push(v);
      if (!this.matchOp(",")) break;
    }
    this.matchOp("]");
    return list(...items);
  }

  // A full expression parse; returns undefined on any unresolvable token
  consume() {
    const v = this.expr();
    // trailing junk after a valid expression → return the leading portion
    return v;
  }
}

export function value(stringExpression) {
  if (stringExpression == null) return undefined;
  const input = String(stringExpression);
  const trimmed = input.trim();
  if (trimmed === "") return "";
  const tokens = tokenize(trimmed);
  const parser = new Parser(tokens);
  return parser.consume();
}