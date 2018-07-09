// @flow

import Parser from './parser'

const parser = new Parser()

export default {
	parse( source: string ): any {
		return parser.parse( source )
	}
}
