import { test } from "node:test"
import assert from "node:assert/strict"
import { SearchShortcut } from "./dist/components/index.js"

class FakeElement {
  constructor(tagName, isContentEditable = false) {
    this.tagName = tagName
    this.isContentEditable = isContentEditable
  }
}

function pressKey(event) {
  let handler
  let clicks = 0
  globalThis.HTMLElement = FakeElement
  globalThis.document = {
    addEventListener: (_type, fn) => {
      handler = fn
    },
    querySelector: () => ({ click: () => clicks++ }),
  }
  new Function(SearchShortcut().afterDOMLoaded)()
  handler({ preventDefault() {}, target: new FakeElement("BODY"), ...event })
  return clicks
}

test("/ on the page opens search", () => {
  assert.equal(pressKey({ key: "/" }), 1)
})

test("/ while typing does not open search", () => {
  assert.equal(pressKey({ key: "/", target: new FakeElement("INPUT") }), 0)
  assert.equal(pressKey({ key: "/", target: new FakeElement("TEXTAREA") }), 0)
  assert.equal(pressKey({ key: "/", target: new FakeElement("DIV", true) }), 0)
})

test("other keys and modifier combos are ignored", () => {
  assert.equal(pressKey({ key: "k" }), 0)
  assert.equal(pressKey({ key: "/", metaKey: true }), 0)
  assert.equal(pressKey({ key: "/", ctrlKey: true }), 0)
})
