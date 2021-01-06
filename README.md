# @aahdrien/needle

This package is based on [@bigyouth/base](https://www.npmjs.com/package/@bigyouth/base)

## Getting started

```bash
npm i @aahdrien/needle
```

## Usage

### createComponent

Create a component logic and bind it to DOM Element. If multiple elements match the name, multiple instances will be created (one for each element). DOM changes are automatically listen so added nodes matching a component definition will be mounted and removed ones will be unmounted.

```html
<!-- index.html -->

<section js-foo="{ bar: 'bar' }">
  <h1 js-foo-title>Come closer!</h1>
  <button js-foo-button>Button: 1</button>
  <button js-foo-button>Button: 2</button>
  <button js-foo-button>Button: 3</button>
  <button js-foo-button>Button: 4</button>
  <button js-foo-button>Button: 5</button>
</section>
```

```js
// index.js

import { createComponent } from '@aahdrien/needle'

createComponent({
  /**
   * Will match every DOM Element with js-{name} attribute (eg: 'js-foo')
   * This the only required property and must be a string
  */
  name: 'foo',

  /**
   * ui object will be parsed and replaced
   * this.ui.title will contain the first child of Foo
   * matching `[js-foo-title]`
   * this.ui.button will be an Array of every child of Foo
   * matching `[js-foo-button]`.
   * The value can be any valid query selector
  */
  ui: {
    title: '[js-foo-title]',
    // prefix key with [] to get every child
    'button[]': '[js-foo-button]'
  },

  /**
   * Events declared using this syntax will be
   * automatically bound on mount and unbound
   * on willUnmount
  */
  events: [
    {
      /**
       * The target must match a key declared in ui.
       * If the key match an Array, every element
       * will have the event listened.
      */
      target: 'button',
      // The event or events to listen
      on: ['mousedown', 'mouseup'],
      // The funcion to call when the event triggers
      handle (event) {
        // Note that you can access this from handles like any other method
        console.log(`${event.target.textContent}`)
      }
    },
    {
      /**
       * You can omit the target to listen events on the
       * DOM Element matching the name instead of a child
      */
      on: 'mouseenter',
      /**
       * Handle can be the name of a method
       * It's usefull if you want to match events
       * on different targets with the same callback
      */
      handle: 'onMouseEnter'
    },
    {
      on: 'mouseleave',
      handle: 'onMouseLeave'
    }
  ],

  // a simple property
  counter: 0,

  /**
   * Lifecycle method, called when a matching DOM Element is found in the DOM
   * ⚠️ WARNING ⚠️
   * Using init is discouraged. Its purpose is to implement advanced behaviors
   * like hacking lifecycle to listen screen resize.
   * For any other purpose, consider using `componentDidMount` instead.
   */
  init () {
    // this.el is the element on which the component has been mounted
    console.log('element:', this.el)

    /**
     * this.props is the value of the attribute from the DOM
     * It can be any valid JS value
     * js-foo="'bar'" // this.props: 'bar'
     * js-foo="42" // this.props: 42
     * js-foo="{ bar: 'bar' }}" // this.props: { bar: 'bar' }
    */
    console.log('props:', JSON.stringify(this.props))

    // this.ui is an empty object when `init` is called
  },

  // Lifecycle method, called after `init` and after ui config has been resolved and events bound
  componentDidMount () {
    console.log('title:', this.ui.title)
  },

  // Lifecycle method, called when the DOM Element or its children has changed
  componentDidUpdate () {},

  // Lifecycle method, called when the DOM Element is no longer in the DOM
  componentWillUnmount () {},

  onMouseEnter () {
    this.ui.title.textContent = 'Not that close!'
  },

  onMouseLeave () {
    this.ui.title.textContent = 'Come closer!'
  }
})
```

### get

Find the first DOM Element matching a query selector. If a root is provided, the element will be search among the root's children.

```js
import { get } from '@aahdrien/needle'

const foo = get('[js-foo]') // <section js-foo="{ bar: 'bar' }">...</section>
const title = get('[js-foo-title]', foo) // <h1 js-foo-title>Come closer!</h1>
```

### getAll

Find every DOM Element matching a query selector and return them as an Array. If a root is provided, the elements will be search among the root's children.

```js
import { getAll } from '@aahdrien/needle'

const buttons = getAll('[js-foo-button]', foo)
/**
 * [
 *   <button js-foo-button>Button: 1</button>,
 *   <button js-foo-button>Button: 2</button>,
 *   <button js-foo-button>Button: 3</button>,
 *   <button js-foo-button>Button: 4</button>,
 *   <button js-foo-button>Button: 5</button>
 * ]
*/
```

### on

Returns an event binder. Once called with the DOM element which should have the event listened, the binder will return a function to unbind the event.

```js
import { on } from '@aahdrien/needle'

// the last argument isn't needed
const enventBinder = on('mousenter', () => {
  title.textContent = 'Not that close!'
}, { once: true })
const unbind = enventBinder(foo)
// remove event
unbind()

// short version
const unbind2 = on('mousenter', () => {
  title.textContent = 'Not that close!'
}, { once: true })(foo)
// remove event
unbind2()

// advanced usage - listen on multiple elements
const unbinds = buttons.map(on('click', event => console.log(`${event.target.textContent}`)))
// remove events
unbinds.forEach(unbindOne => unbindOne())
```

### html

Returns a string from the template. Use this function for simple templating like small injections of content received from AJAX.

```js
import { get, html } from '@aahdrien/needle'

const root = get('#root')

const messages = ['foo', 'bar', 'baz']

const item = message => html`
<li>
  <span>${message}</span>
</li>
`

root.innerHTML = html`
<ul>
  ${messages.map(item)}
</ul>
`
```

This example is overly complicated for demonstration purpose only.
