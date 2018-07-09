// @flow

import Walker from './walker'
import Lexer from './lexer'
import types from './types'

interface IError {
	message: string,
	pos?: number
}

interface IToken {
	type: Symbol,
	value?: any,
	pos?: Object
}

export default class Parser {
	walker: Walker<IToken>

	parse( source: string ) {
		this.walker = new Walker( stripWhiteSpace( new Lexer().lex( source ) ) )
		return this.statement()
	}

	error( e: IError ) {
		console.error( e.message );
	}

	accept( type: Symbol ) {
		const token = this.walker.current()
		if ( token && token.type === type ) {
			this.walker.next()
			return token
		}
	}

	expect( type: Symbol ) {
		const token = this.walker.current()
		if ( token && token.type === type ) {
			this.walker.next()
			return token
		}

		this.error( {
			message: `Expect ${ type.toString() }, but got ${ token.type.toString() }`
		} )
	}

	// array | object | string | number | ident
	statement() {
		const token = this.walker.current()
		switch ( token.type ) {
			case types.OBJECT_START:
				return this.object()
			case types.ARRAY_START:
				return this.array()
			case types.STRING:
			case types.NUMBER:
				this.walker.next()
				return token.value
			case types.IDENT:
				// only allow a few idents in value position
				// like: null, NaN
				switch ( token.value ) {
					case 'null':
						this.walker.next()
						return null
					case 'NaN':
						this.walker.next()
						return NaN
					default:
						this.error( {
							message: `Unrecoginized ident`
						} )
						return
				}
			default:
				// skip
		}
	}

	// { ident|string|number: statement [,ident|string|number: statement]* }
	object(): Object {
		this.expect( types.OBJECT_START )

		const properties: any = {}

		let key
		while (
			key = (
				this.accept( types.IDENT ) ||
				this.accept( types.STRING ) ||
				this.accept( types.NUMBER )
			)
		) {
			this.expect( types.COLON )
			properties[ key.value ] = this.statement()
			if ( !this.accept( types.COMMA ) ) {
				break
			}
		}

		this.expect( types.OBJECT_END )

		return properties
	}

	// [ statement [, statement]* ]
	array(): any[] {
		this.expect( types.ARRAY_START )

		const elements = []

		while ( !this.accept( types.ARRAY_END ) ) {
			elements.push( this.statement() )
			if ( this.accept( types.ARRAY_END ) ) {
				break
			} else {
				this.accept( types.COMMA )
			}
		}

		return elements
	}
}

function stripWhiteSpace( tokens ) {
	const striped = []

	for ( const token of tokens ) {
		if ( token.type !== types.WHITESPACE ) {
			striped.push( token )
		}
	}

	return striped
}
