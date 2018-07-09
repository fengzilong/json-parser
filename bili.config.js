const pkg = require( './package.json' )

module.exports = {
	format: 'all',
	compress: true,
	moduleName: 'json',
	banner: {
		name: '@unfancy/json',
		version: pkg.version,
		author: 'fengzilong',
		license: 'MIT',
		year: new Date().getFullYear()
	},
	buble: {
		transforms: {
			generator: true,
		}
	},
	browser: true,
	esModules: true,
	flow: true
}
