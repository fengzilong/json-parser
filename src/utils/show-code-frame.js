// @flow

export default function ( source: string, pos: number ): string {
  const lines = source.split( '\n' )
  const lineCount = lines.length + 1
  let rest = pos
  
  let row = 0
  let column = 0
  
  lines.some( ( line, index ) => {
    if ( rest < line.length ) {
      row = index
      column = rest
      return true
    }
    
    rest = rest - line.length - 1
    return false
  } )
  
  // console.log( row, column )
  
  const lineNoLen = maxRowLength( row )
  const frames = [
    wrap( row - 1, lineNoLen ),
    wrap( row, lineNoLen ),
    indicate( row, column ),
    wrap( row + 1, lineNoLen ),
  ]
  
  console.log( frames.join( '\n' ) )
  
  function wrap( lineNo, len ) {
    if ( typeof lines[ lineNo ] !== 'undefined' ) {
      return `[${ padZero( lineNo + 1, len ) }] ${ lines[ lineNo ] }`.replace( /\t/g, '  ' )
    }
  }
  
  function indicate( row, column ) {
    const line = lines[ row ]
    
    return spaces( maxRowLength( row ) + 3 ) +
      spaces( leadingTabsToSpaces( line.slice( 0, column ) ).length ) + '^'
  }
  
  function padZero( str, num ) {
    str = String( str )
    return repeat( '0', num - str.length ) + str
  }
  
  function repeat( char, num ) {
    return new Array( num + 1 ).join( char )
  }
  
  function maxRowLength( row ) {
    return String( row + 1 ).length
  }
  
  function spaces(n) {
    return new Array(n+1).join(" ")
  }
  
  function leadingTabsToSpaces(str) {
    return str.replace( /^\t+/, function(match) {
      return match.split('\t').join('  ');
    } )
  }
}
