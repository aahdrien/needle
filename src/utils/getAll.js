const reg = /^[.#]?[\w-_]+$/

const getById = (selector, from) => {
  const element =
    from === document
      ? from.getElementById(selector.slice(1))
      : from.querySelector(selector)

  return element ? [element] : []
}

export default (selector, from = document) => {
  if (selector.search(reg) === 0) {
    switch (selector[0]) {
      case '.':
        return Array.from(from.getElementsByClassName(selector.slice(1)))
      case '#':
        return getById(selector, from)
      default:
        return Array.from(from.getElementsByTagName(selector))
    }
  }

  return Array.from(from.querySelectorAll(selector))
}
