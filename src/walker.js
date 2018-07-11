// @flow

export default class Walker<T> {
  source: T[]
  index: number

  constructor( source: T[] ) {
    this.source = source
    this.index = 0
  }

  eof(): boolean {
    if ( typeof this.source.length !== 'undefined' ) {
      return this.index === this.source.length
    }

    return true
  }

  pos(): number {
    return this.index
  }

  current(): T {
    return this.source[ this.index ]
  }

  next(): T {
    this.index++
    return this.source[ this.index ]
  }

  go( n: number ): void {
    this.index = this.index + n
  }

  read( regex: RegExp ): string | void {
    if ( !regex.source.startsWith( '^' ) ) {
      regex = new RegExp( `^${ regex.source }` )
    }

    if ( typeof this.source === 'string' ) {
      const result: string[] = regex.exec( this.source.slice( this.index ) )
      if ( result && result[ 0 ] ) {
        this.go( result[ 0 ].length )
        return result[ 0 ]
      }
    }
  }
}
