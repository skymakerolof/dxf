import config from '../config'

function info() {
  if (config.verbose) {
    console.info.apply(undefined, arguments)
  }
}

function warn() {
  if (config.verbose) {
    console.warn.apply(undefined, arguments)
  }
}

function error() {
  console.error.apply(undefined, arguments)
}

export default {
  info,
  warn,
  error,
}
