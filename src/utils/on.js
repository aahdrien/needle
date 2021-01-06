export default (event, cb, options) => el => {
  el.addEventListener(event, cb, options)

  return () => el.removeEventListener(event, cb, options)
}
