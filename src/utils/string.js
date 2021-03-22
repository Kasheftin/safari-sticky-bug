export function addCssSuffix (input, suffix) {
  if (!suffix) {
    suffix = 'px'
  }
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).reduce((out, key) => {
      out[key] = addCssSuffix(input[key], suffix)
      return out
    }, {})
  } else {
    return input === null || isNaN(Number(input)) ? input : input + suffix
  }
}
