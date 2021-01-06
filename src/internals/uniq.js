const last = {}

export default prefix => {
  if (!(prefix in last)) last[prefix] = 0

  return `${prefix}-${last[prefix]++}`
}
