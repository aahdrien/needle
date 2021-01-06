import safeEval from './safeEval'
import get from '../utils/get'
import getAll from '../utils/getAll'
import bindEvent from '../utils/on'

const reg = /^\w+\[]$/

const noop = () => {}

const BASE = {
  init: noop,
  componentDidUpdate: noop
}

const applyForEach = (method, items) =>
  (!Array.isArray(items) ? method(items) : items.map(method))

export default ({
  componentDidMount,
  componentWillUnmount,
  ui,
  events,
  props: overridingProps,
  ...config
}) => (el, strProps) => {
  let boundEvents

  const throwError = (message, got) => {
    throw new Error(
      `\n\nError in component ${config.name}:\n${message}\nGot: ${got}\n\n`
    )
  }

  if (overridingProps) {
    throwError('props field is reserved for read-only values from DOM', overridingProps)
  }

  const attachUI = () =>
    Object.keys(ui).forEach(key => {
      if (key.match(reg)) {
        self.ui[key.substring(0, key.length - 2)] = getAll(ui[key], el)
      } else {
        self.ui[key] = get(ui[key], el)
      }
    })

  const bindEvents = () =>
    events
      .map(({ target: cTarget, on, handle: cHandle, props }) => {
        let target
        if (typeof cTarget === 'undefined') {
          target = el
        } else if (typeof cTarget === 'string' && cTarget in self.ui) {
          target = self.ui[cTarget]
        } else {
          throwError(
            "Event's target must be declared in ui object or undefined to target component's root element",
            cTarget
          )
        }

        let handle = typeof cHandle === 'string' ? self[cHandle] : cHandle

        if (typeof handle !== 'function') {
          throwError(
            "Event's handle must be a function or the name of a function declared for this component",
            cHandle
          )
        }

        handle = handle.bind(self)

        return applyForEach(
          on => applyForEach(bindEvent(on, handle, props), target),
          on
        )
      })
      .flat()

  let props

  if (strProps !== '') {
    try {
      props = safeEval(strProps)
    } catch ({ message }) {
      throwError(
        `Error evaluating props: ${message}`,
        strProps
      )
    }
  }

  const self = {
    ...BASE,
    el,
    props,
    ui: {},
    ...config,
    componentDidMount () {
      if (ui) attachUI()

      boundEvents = events ? bindEvents() : []

      if (componentDidMount) componentDidMount.call(self)
    },

    componentWillUnmount () {
      boundEvents.forEach(unbind => unbind())

      if (componentWillUnmount) componentWillUnmount.call(self)
    }
  }

  Object.keys(config).forEach(key => {
    const value = config[key]
    if (typeof value === 'function') {
      self[key] = value.bind(self)
    }
  })

  return self
}
