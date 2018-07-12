import json from '../src'

function parseAssert( input, output ) {
  return expect( json.parse( input ) ).toEqual( output )
}

function parseErrorAssert( input ) {
  return expect( () => json.parse( input ) ).toThrowError()
}

test( 'number', () => {
  parseAssert(
    `{ key: 1 }`,
    {
      key: 1
    }
  )
} )

test( 'null', () => {
  parseAssert(
    `{ key: null }`,
    {
      key: null
    }
  )
} )

test( 'NaN', () => {
  parseAssert(
    `{ key: NaN }`,
    {
      key: NaN
    }
  )
} )

test( 'Infinity', () => {
  parseAssert(
    `{ key: Infinity }`,
    {
      key: Infinity
    }
  )
} )

test( '-Infinity', () => {
  parseAssert(
    `{ key: -Infinity }`,
    {
      key: -Infinity
    }
  )
} )

test( 'value in array', () => {
  parseAssert(
    `[ 1, '2', null, Infinity, -Infinity ]`,
    [ 1, '2', null, Infinity, -Infinity ]
  )
} )

test( 'keyword in key', () => {
  parseAssert(
    `{ null: 1 }`,
    {
      null: 1
    }
  )
  
  parseAssert(
    `{ '*null*': 1 }`,
    {
      '*null*': 1
    }
  )
  
  parseAssert(
    `{ NaN: 1 }`,
    {
      NaN: 1
    }
  )
  parseAssert(
    `{ '*NaN*': 1 }`,
    {
      '*NaN*': 1
    }
  )
} )

test( 'object in string', () => {
  parseAssert(
    `{ key: '{ a: "b" }' }`,
    {
      key: '{ a: "b" }'
    }
  )
} )

test( 'array in string', () => {
  parseAssert(
    `{ key: '[ 1, "2", null ]' }`,
    {
      key: '[ 1, "2", null ]'
    }
  )
} )

test( 'trailing comma', () => {
  parseAssert(
    `
      {
        key: 1,
        key2: 2,
      }
    `,
    {
      key: 1,
      key2: 2,
    }
  )
  
  parseAssert(
    `
      [
        1,
        2,
      ]
    `,
    [
      1,
      2
    ]
  )
} )

test( 'mixed quotes', () => {
  parseAssert(
    `{ key: '\\'"test"\\'' }`,
    {
      key: '\'"test"\''
    }
  )
} )

test( 'float', () => {
  parseAssert(
    `{ key: .7 }`,
    {
      key: 0.7
    }
  )
  
  parseAssert(
    `{ key: 1.7 }`,
    {
      key: 1.7
    }
  )
  
  parseAssert(
    `{ key: -.7 }`,
    {
      key: -0.7
    }
  )
  
  parseAssert(
    `{ key: +.7 }`,
    {
      key: 0.7
    }
  )
} )

test( 'multiple-line string', () => {
  parseAssert(
    `{ key: \`
  { 'test': "multiple-line" }
\` }`,
    {
      key: "\n  { 'test': \"multiple-line\" }\n"
    }
  )
  
  parseAssert(
    `{ key: \`'"test00.1:null,NaN"\` }`,
    {
      key: "'\"test00.1:null,NaN\""
    }
  )
} )

test( 'comment', () => {
  parseAssert(
    `
      // leading comment
      { / * test * /
        x: 1, // haha
        y: 2
      }
      /* trailing comment */
    `,
    {
      x: 1,
      y: 2
    }
  )
} )

test( 'error', () => {
  parseErrorAssert( `{ key: * 1}` )
  parseErrorAssert( `{ key: 1, // some comment }` )
  parseErrorAssert( `{ x: "1, y: 2 }` )
} )
