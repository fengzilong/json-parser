// @flow

import Walker from './walker'
import Lexer from './lexer'
import types from './types'
import showCodeFrame from './utils/show-code-frame'

export default class Parser {
  walker: Walker<IToken>

  parse( source: string ) {
    this.source = source
    let tokens = new Lexer().lex( source )
    tokens = strip( tokens, [
      types.WHITESPACE,
      types.COMMENT
    ] )
    this.walker = new Walker( tokens )
    return this.statement()
  }

  error( e: IError ) {
    showCodeFrame( this.source, e.pos )
    console.log( e.message )
    throw new Error( e.message )
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
      message: `Expect ${ type.toString() }` + (
        token ?
        `, but got ${ token.type.toString() }` :
        ''
      ),
      pos: token && token.pos ? token.pos.start : this.source.length - 1
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
    case types.EOF:
      this.walker.next()
    default:
      // skip
    }
  }

  // { ident|string|number: statement [,ident|string|number: statement]* }
  object(): Object {
    this.expect( types.OBJECT_START )

    const properties: Object = {}

    let key
    /* eslint-disable */
    while (
      key = (
        this.accept( types.IDENT ) ||
        this.accept( types.STRING ) ||
        this.accept( types.NUMBER )
      )
    ) {
      /* eslint-enable */
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

function strip( tokens, ignoreTypes ) {
  const striped = []

  for ( const token: IToken of tokens ) {
    if ( !ignoreTypes.includes( token.type ) ) {
      striped.push( token )
    }
  }

  return striped
}
