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
export default (htmlString, ...keys) =>
  htmlString.reduce((acc, string, i) => {
    let newAcc = acc + string

    if (i < keys.length) {
      const key = keys[i]

      newAcc += key instanceof Array ? key.join('') : key
    }

    return newAcc
  }, '')
