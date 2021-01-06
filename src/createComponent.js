import createFactory from './internals/createFactory'
import uniq from './internals/uniq'

let factoriesSelector = ''
const factories = {}
// window.byBaseDebugInstances will be used in debug addon
const instances = window.byBaseDebugInstance || {}

const unmountInstance = tag => {
  instances[tag].componentWillUnmount()
  delete instances[tag]
}

/**
 * Unmount every component attached to element and
 * remove it from instances
 * @param {Element} el
 */
const detachElement = el =>
  el['_factory-tags'] &&
  Object.values(el['_factory-tags']).forEach(unmountInstance)

/**
 *
 * @param {*} factory
 */
const tryMountComponent = (el, name, props) => {
  if (name in factories) {
    if (!('_factory-tags' in el)) el['_factory-tags'] = {}

    const tags = el['_factory-tags']

    if (!Object.keys(tags).includes(name)) {
      try {
        const tag = (tags[name] = uniq(name))
        const factory = factories[name]
        const instance = (instances[tag] = factory(el, props))
        instance.init()
        instance.componentDidMount()
      } catch (error) {
        throw error
      }
    }
  }
}

const tryMountComponents = el => {
  if (el.matches(factoriesSelector)) {
    ;[...el.attributes].forEach(
      ({ nodeName, nodeValue }) =>
        nodeName.startsWith('js-') &&
        tryMountComponent(el, nodeName.substring(3), nodeValue)
    )
  }
}

const getAllComponents = from => [
  ...document.querySelectorAll(factoriesSelector)
]

const mapFactories = (root = document.body) => {
  tryMountComponents(root)
  getAllComponents(root).forEach(tryMountComponents)
}

const observer = new window.MutationObserver(mutations => {
  const { targets, allAddedNodes, allRemovedNodes } = mutations.reduce(
    (
      { targets, allAddedNodes, allRemovedNodes },
      { target, addedNodes, removedNodes }
    ) => ({
      targets: [...targets, target],
      allAddedNodes: [...allAddedNodes, ...addedNodes],
      allRemovedNodes: [...allRemovedNodes, ...addedNodes]
    }),
    {
      targets: [],
      allAddedNodes: [],
      allRemovedNodes: []
    }
  )

  const { movedNodes, newNodes } = allAddedNodes.reduce(
    ({ movedNodes, newNodes }, node) => {
      const removeIndex = allRemovedNodes.indexOf(node)
      if (removeIndex !== -1) {
        movedNodes.push(node)
        allRemovedNodes.splice(removeIndex, 1)
      } else {
        newNodes.push(node)
      }

      return { movedNodes, newNodes }
    },
    {
      movedNodes: [],
      newNodes: []
    }
  )

  ;[...movedNodes, ...(new Set(targets))].filter(node => node.nodeType === 1).forEach(target => {
    const targetInstances = target['_factory-tags']
    if (targetInstances) {
      Object.keys(targetInstances).forEach(name => {
        const tag = targetInstances[name]
        if (tag in instances) {
          const instance = instances[tag]

          if (target.getAttribute(`js-${name}`) === null) { // unmount component
            delete targetInstances[name]
            unmountInstance(tag)
          } else {
            instance.componentDidUpdate()
          }
        }
      })
    }

    // tryMountComponents(target)

    if (
      target && 
      document.attachEvent 
      ? document.readyState === 'complete' 
      : document.readyState !== 'loading'
    ) {
      mapFactories(target)
    }
  })
  newNodes.filter(node => node.nodeType === 1).forEach(mapFactories)
  allRemovedNodes.filter(node => node.nodeType === 1).forEach(node => {
    getAllComponents(node).forEach(detachElement)
    detachElement(node)
  })
})

observer.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true
})

if (
  document.attachEvent
    ? document.readyState === 'complete'
    : document.readyState !== 'loading'
) {
  mapFactories()
} else {
  document.addEventListener('DOMContentLoaded', () => mapFactories())
}

export default config => {
  const { name } = config

  if (!name) {
    throw new Error('Config object must contain at least a name property')
  }

  if (name in factories) {
    throw new Error(`Multiple components have been declared with name: ${name}`)
  }

  factories[name] = createFactory(config)
  factoriesSelector = `${factoriesSelector ? `${factoriesSelector},` : ''}[js-${name}]`
}
