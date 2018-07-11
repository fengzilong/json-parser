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

    return tokens
  }

  error( e: IError ) {
    console.error( e.message )
  }

  next() {
    const start = this.walker.pos()
    const token: any = (
      this.string() ||
      this.symbol() ||
      this.number() ||
      this.ident() ||
      this.whitespace() ||
      this.unknown()
    )
    const end = this.walker.pos()

    token.pos = { start, end }

    return token
  }

  string() {
    const char = this.walker.current()

    if ( char === `'` || char === `"` ) {
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

  symbol() {
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

  whitespace() {
    const pattern = /\s+/
    if ( pattern.test( this.walker.current() ) ) {
      return {
        type: types.WHITESPACE,
        value: this.walker.read( pattern )
      }
    }
  }

  number() {
    const char = this.walker.current()

    if (
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

  readNumber() {
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

  ident() {
    if ( /[$_a-zA-Z]+/.test( this.walker.current() ) ) {
      return {
        type: types.IDENT,
        value: this.walker.read( /^[$_a-zA-Z][$_a-zA-Z0-9]*/ )
      }
    }
  }

  unknown() {
    const char = this.walker.current()
    this.walker.next()
    return {
      type: types.UNKNOWN,
      value: char
    }
  }
}
