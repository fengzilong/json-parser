// @flow

export default class Walker<T> {
  source: T[]
  index: number

  constructor( source: T[] ) {
    this.source = source
    this.index = 0
  }
  
  error( e: IError ) {
    console.error( e.message )
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
  
  slice( start: number, end: number ): T[] {
    return this.source.slice( start, end )
  }
  
  peep( test: string | RegExp ): boolean {
    const rest = this.source.slice( this.index )
    if ( typeof test === 'string' ) {
      return this.source.slice( this.index ).startsWith( test )
    }
    
    if ( test instanceof RegExp ) {
      if ( !test.source.startsWith( '^' ) ) {
        test = new RegExp( `^${ test.source }` )
      }
      
      return test.test( this.source.slice( this.index ) )
    }
    
    throw new Error( 'Expected string or regexp as params for walker.peep' )
    
    return false
  }
  
  readUtil( test ): T[] {
    if ( !test.source.startsWith( '^' ) ) {
      test = new RegExp( `^${ test.source }` )
    }
    
    const start = this.index

    while( true ) {
      if ( this.index === this.source.length ) {
        break
      }
      
      if ( typeof this.read( test ) === 'undefined' ) {
        this.index = this.index + 1
      } else {
        break
      }
    }
    
    const end = this.index
    return this.source.slice( start, end )
  }
}
