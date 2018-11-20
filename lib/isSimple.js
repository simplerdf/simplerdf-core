function isSimple (object) {
  return typeof object._context === 'object'
}

module.exports = isSimple
