const pkg = require( './package.json' )

module.exports = {
  format: [ 'cjs', 'umd', 'es' ],
  moduleName: 'json',
  banner: {
    name: '@unfancy/json',
    version: pkg.version,
    author: 'fengzilong',
    license: 'MIT',
    year: new Date().getFullYear()
  },
}
