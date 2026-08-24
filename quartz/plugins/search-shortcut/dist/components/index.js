// Hand-written dist/: Quartz imports it directly and skips the npm install + tsup cycle.
const script = `
document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return
  const target = e.target
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  ) {
    return
  }
  e.preventDefault()
  document.querySelector(".search-button")?.click()
})
`

export const SearchShortcut = () => {
  const Component = () => null
  Component.afterDOMLoaded = script
  return Component
}
