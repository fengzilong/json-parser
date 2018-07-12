// @flow

import Walker from './walker'
import types from './types'

export default class Lexer {
  walker: Walker<*>

  constructor( source?: any ) {
    if ( source ) {
      this.walker = new Walker( source )
    }
  }

  lex( source: any ) {
    const tokens = []

    // regenerate walker if new source is provided
    if ( source ) {
      this.walker = new Walker( source )
    }

    while ( !this.walker.eof() ) {
      tokens.push( this.next() )
    }
    
    tokens.push( {
      type: types.EOF,
      pos: {
        start: source.length - 1
      }
    } )

    return tokens
  }

  error( e: IError ) {
    console.error( e.message )
  }

  next() {
    const start = this.walker.pos()
    const token: any = (
      this.comment() ||
      this.string() ||
      this.symbol() ||
      this.number() ||
      this.ident() ||
      this.whitespace() ||
      this.unknown()
    )
    const end = this.walker.pos()

    token.pos = { start, end }
    token.frame = this.walker.slice( start, end )

    return token
  }
  
  comment(): IToken | void {
    const char = this.walker.current()
    
    // '//' or '/*' or '/ *'
    if ( this.walker.peep( /(\/\/|\/\s*\*)/ ) ) {
      return {
        type: types.COMMENT,
        value: this.readComment()
      }
    }
  }
  
  readComment(): string {
    const start = this.walker.pos()
    let terminator = null
    if ( this.walker.peep( '//' ) ) {
      terminator = /\n/
    } else {
      terminator = /\*\s*\//
    }
    return this.walker.readUtil( terminator )
  }

  string(): IToken | void {
    const char = this.walker.current()

    if ( char === `'` || char === `"` || char === '`' ) {
      return {
        type: types.STRING,
        value: this.readString( char )
      }
    }
  }

  readString( quote: string ): string {
    this.walker.next() // skip start quote
    let escaped = false
    let str = ''

    let char = this.walker.current()
    while ( char ) {
      if ( char === quote ) {
        if ( escaped ) {
          str = str + char
          escaped = false
        } else {
          this.walker.next()
          break
        }
      } else if ( char === '\\' ) {
        escaped = true
      } else {
        str = str + char
      }

      char = this.walker.next()
    }

    return str
  }

  symbol(): IToken | void {
    const char = this.walker.current()

    switch ( char ) {
    case '[':
      this.walker.next()
      return {
        type: types.ARRAY_START,
      }
    case ']':
      this.walker.next()
      return {
        type: types.ARRAY_END,
      }
    case '{':
      this.walker.next()
      return {
        type: types.OBJECT_START,
      }
    case '}':
      this.walker.next()
      return {
        type: types.OBJECT_END,
      }
    case ',':
      this.walker.next()
      return {
        type: types.COMMA,
      }
    case ':':
      this.walker.next()
      return {
        type: types.COLON,
      }
    default:
      // skip
    }
  }

  whitespace(): IToken | void {
    const pattern = /\s+/
    if ( pattern.test( this.walker.current() ) ) {
      return {
        type: types.WHITESPACE,
        value: this.walker.read( pattern )
      }
    }
  }

  number(): IToken | void {
    const char = this.walker.current()
    
    if (
      this.walker.peep( '-Infinity' ) ||
      this.walker.peep( 'Infinity' ) ||
      /\d+/.test( char ) ||
      char === '.' ||
      char === '+' ||
      char === '-'
    ) {
      return {
        type: types.NUMBER,
        value: this.readNumber()
      }
    }
  }

  readNumber(): number {
    let num = ''
    let dot = false
    const pattern = /\d+/

    // +-
    const prefix = this.walker.read( /[+-]/ ) || ''

    // Infinity
    const infinity = this.walker.read( /Infinity/ )

    if ( infinity ) {
      return prefix === '-' ?
        -Infinity :
        Infinity
    }

    let char = this.walker.current()
    while ( char ) {
      if ( pattern.test( char ) ) { // is number char
        num = num + char
      } else if ( char === '.' ) { // is .
        if ( !dot ) { // eslint-disable-line
          num = num + '.'
          dot = true
        } else {
          this.error( {
            message: 'Invalid number',
            pos: this.walker.pos()
          } )
        }
      } else {
        break
      }

      char = this.walker.next()
    }

    return parseFloat( prefix + num )
  }

  ident(): IToken | void {
    if ( /[$_a-zA-Z]+/.test( this.walker.current() ) ) {
      return {
        type: types.IDENT,
        value: this.walker.read( /^[$_a-zA-Z][$_a-zA-Z0-9]*/ )
      }
    }
  }

  unknown(): IToken {
    const char = this.walker.current()
    this.walker.next()
    return {
      type: types.UNKNOWN,
      value: char
    }
  }
}
