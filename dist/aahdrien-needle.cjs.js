'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reg = /^[.#]?[\w-_]+$/;

var get = (function (selector) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (selector.search(reg) === 0) {
    switch (selector[0]) {
      case '.':
        return from.getElementsByClassName(selector.slice(1))[0];
      case '#':
        return from === document ? from.getElementById(selector.slice(1)) : from.querySelector(selector);
      default:
        return from.getElementsByTagName(selector)[0];
    }
  }

  return from.querySelector(selector);
});

var reg$1 = /^[.#]?[\w-_]+$/;

var getById = function getById(selector, from) {
  var element = from === document ? from.getElementById(selector.slice(1)) : from.querySelector(selector);

  return element ? [element] : [];
};

var getAll = (function (selector) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (selector.search(reg$1) === 0) {
    switch (selector[0]) {
      case '.':
        return Array.from(from.getElementsByClassName(selector.slice(1)));
      case '#':
        return getById(selector, from);
      default:
        return Array.from(from.getElementsByTagName(selector));
    }
  }

  return Array.from(from.querySelectorAll(selector));
});

var bindEvent = (function (event, cb, options) {
  return function (el) {
    el.addEventListener(event, cb, options);

    return function () {
      return el.removeEventListener(event, cb, options);
    };
  };
});

var safeEval = (function (template) {
  return new Function("'use strict';return " + template)();
}); // eslint-disable-line

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var reg$2 = /^\w+\[]$/;

var noop = function noop() {};

var BASE = {
  init: noop,
  componentDidUpdate: noop
};

var applyForEach = function applyForEach(method, items) {
  return !Array.isArray(items) ? method(items) : items.map(method);
};

var createFactory = (function (_ref) {
  var _componentDidMount = _ref.componentDidMount,
      _componentWillUnmount = _ref.componentWillUnmount,
      ui = _ref.ui,
      events = _ref.events,
      overridingProps = _ref.props,
      config = _objectWithoutProperties(_ref, ['componentDidMount', 'componentWillUnmount', 'ui', 'events', 'props']);

  return function (el, strProps) {
    var boundEvents = void 0;

    var throwError = function throwError(message, got) {
      throw new Error('\n\nError in component ' + config.name + ':\n' + message + '\nGot: ' + got + '\n\n');
    };

    if (overridingProps) {
      throwError('props field is reserved for read-only values from DOM', overridingProps);
    }

    var attachUI = function attachUI() {
      return Object.keys(ui).forEach(function (key) {
        if (key.match(reg$2)) {
          self.ui[key.substring(0, key.length - 2)] = getAll(ui[key], el);
        } else {
          self.ui[key] = get(ui[key], el);
        }
      });
    };

    var bindEvents = function bindEvents() {
      return events.map(function (_ref2) {
        var cTarget = _ref2.target,
            on = _ref2.on,
            cHandle = _ref2.handle,
            props = _ref2.props;

        var target = void 0;
        if (typeof cTarget === 'undefined') {
          target = el;
        } else if (typeof cTarget === 'string' && cTarget in self.ui) {
          target = self.ui[cTarget];
        } else {
          throwError("Event's target must be declared in ui object or undefined to target component's root element", cTarget);
        }

        var handle = typeof cHandle === 'string' ? self[cHandle] : cHandle;

        if (typeof handle !== 'function') {
          throwError("Event's handle must be a function or the name of a function declared for this component", cHandle);
        }

        handle = handle.bind(self);

        return applyForEach(function (on) {
          return applyForEach(bindEvent(on, handle, props), target);
        }, on);
      }).flat();
    };

    var props = void 0;

    if (strProps !== '') {
      try {
        props = safeEval(strProps);
      } catch (_ref3) {
        var message = _ref3.message;

        throwError('Error evaluating props: ' + message, strProps);
      }
    }

    var self = _extends({}, BASE, {
      el: el,
      props: props,
      ui: {}
    }, config, {
      componentDidMount: function componentDidMount() {
        if (ui) attachUI();

        boundEvents = events ? bindEvents() : [];

        if (_componentDidMount) _componentDidMount.call(self);
      },
      componentWillUnmount: function componentWillUnmount() {
        boundEvents.forEach(function (unbind) {
          return unbind();
        });

        if (_componentWillUnmount) _componentWillUnmount.call(self);
      }
    });

    Object.keys(config).forEach(function (key) {
      var value = config[key];
      if (typeof value === 'function') {
        self[key] = value.bind(self);
      }
    });

    return self;
  };
});

var last = {};

var uniq = (function (prefix) {
  if (!(prefix in last)) last[prefix] = 0;

  return prefix + "-" + last[prefix]++;
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var factoriesSelector = '';
var factories = {};
// window.byBaseDebugInstances will be used in debug addon
var instances = window.byBaseDebugInstance || {};

var unmountInstance = function unmountInstance(tag) {
  instances[tag].componentWillUnmount();
  delete instances[tag];
};

/**
 * Unmount every component attached to element and
 * remove it from instances
 * @param {Element} el
 */
var detachElement = function detachElement(el) {
  return el['_factory-tags'] && Object.values(el['_factory-tags']).forEach(unmountInstance);
};

/**
 *
 * @param {*} factory
 */
var tryMountComponent = function tryMountComponent(el, name, props) {
  if (name in factories) {
    if (!('_factory-tags' in el)) el['_factory-tags'] = {};

    var tags = el['_factory-tags'];

    if (!Object.keys(tags).includes(name)) {
      try {
        var tag = tags[name] = uniq(name);
        var factory = factories[name];
        var instance = instances[tag] = factory(el, props);
        instance.init();
        instance.componentDidMount();
      } catch (error) {
        throw error;
      }
    }
  }
};

var tryMountComponents = function tryMountComponents(el) {
  if (el.matches(factoriesSelector)) {
[].concat(_toConsumableArray(el.attributes)).forEach(function (_ref) {
      var nodeName = _ref.nodeName,
          nodeValue = _ref.nodeValue;
      return nodeName.startsWith('js-') && tryMountComponent(el, nodeName.substring(3), nodeValue);
    });
  }
};

var getAllComponents = function getAllComponents(from) {
  return [].concat(_toConsumableArray(document.querySelectorAll(factoriesSelector)));
};

var mapFactories = function mapFactories() {
  var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

  tryMountComponents(root);
  getAllComponents(root).forEach(tryMountComponents);
};

var observer = new window.MutationObserver(function (mutations) {
  var _mutations$reduce = mutations.reduce(function (_ref2, _ref3) {
    var targets = _ref2.targets,
        allAddedNodes = _ref2.allAddedNodes,
        allRemovedNodes = _ref2.allRemovedNodes;
    var target = _ref3.target,
        addedNodes = _ref3.addedNodes,
        removedNodes = _ref3.removedNodes;
    return {
      targets: [].concat(_toConsumableArray(targets), [target]),
      allAddedNodes: [].concat(_toConsumableArray(allAddedNodes), _toConsumableArray(addedNodes)),
      allRemovedNodes: [].concat(_toConsumableArray(allRemovedNodes), _toConsumableArray(addedNodes))
    };
  }, {
    targets: [],
    allAddedNodes: [],
    allRemovedNodes: []
  }),
      targets = _mutations$reduce.targets,
      allAddedNodes = _mutations$reduce.allAddedNodes,
      allRemovedNodes = _mutations$reduce.allRemovedNodes;

  var _allAddedNodes$reduce = allAddedNodes.reduce(function (_ref4, node) {
    var movedNodes = _ref4.movedNodes,
        newNodes = _ref4.newNodes;

    var removeIndex = allRemovedNodes.indexOf(node);
    if (removeIndex !== -1) {
      movedNodes.push(node);
      allRemovedNodes.splice(removeIndex, 1);
    } else {
      newNodes.push(node);
    }

    return { movedNodes: movedNodes, newNodes: newNodes };
  }, {
    movedNodes: [],
    newNodes: []
  }),
      movedNodes = _allAddedNodes$reduce.movedNodes,
      newNodes = _allAddedNodes$reduce.newNodes;

  [].concat(_toConsumableArray(movedNodes), _toConsumableArray(new Set(targets))).filter(function (node) {
    return node.nodeType === 1;
  }).forEach(function (target) {
    var targetInstances = target['_factory-tags'];
    if (targetInstances) {
      Object.keys(targetInstances).forEach(function (name) {
        var tag = targetInstances[name];
        if (tag in instances) {
          var instance = instances[tag];

          if (target.getAttribute('js-' + name) === null) {
            // unmount component
            delete targetInstances[name];
            unmountInstance(tag);
          } else {
            instance.componentDidUpdate();
          }
        }
      });
    }

    // tryMountComponents(target)

    if (target && document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
      mapFactories(target);
    }
  });
  newNodes.filter(function (node) {
    return node.nodeType === 1;
  }).forEach(mapFactories);
  allRemovedNodes.filter(function (node) {
    return node.nodeType === 1;
  }).forEach(function (node) {
    getAllComponents(node).forEach(detachElement);
    detachElement(node);
  });
});

observer.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true
});

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
  mapFactories();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    return mapFactories();
  });
}

var createComponent = (function (config) {
  var name = config.name;


  if (!name) {
    throw new Error('Config object must contain at least a name property');
  }

  if (name in factories) {
    throw new Error('Multiple components have been declared with name: ' + name);
  }

  factories[name] = createFactory(config);
  factoriesSelector = (factoriesSelector ? factoriesSelector + ',' : '') + '[js-' + name + ']';
});

/**
 * Interprets a template literal as an HTML string
 * @example
 *  const title = text => html`<h1>${text}</h1>`
 *  root.innerHTML = html`
 *  <div>
 *    ${title('Hello World!')}
 *    <ul>
 *      ${list.map(item => `
 *        <li>
 *          <button>${item}</button>
 *        </li>
 *      `)}
 *    </ul>
 *  </div>
 *  `
 */
var html = (function (htmlString) {
  for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    keys[_key - 1] = arguments[_key];
  }

  return htmlString.reduce(function (acc, string, i) {
    var newAcc = acc + string;

    if (i < keys.length) {
      var key = keys[i];

      newAcc += key instanceof Array ? key.join('') : key;
    }

    return newAcc;
  }, '');
});

exports.get = get;
exports.getAll = getAll;
exports.on = bindEvent;
exports.createComponent = createComponent;
exports.html = html;
