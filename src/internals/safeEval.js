export default template => new Function(`'use strict';return ${template}`)() // eslint-disable-line
