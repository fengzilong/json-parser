# json-parser

## Usage

```js
json.parse( `
  {
    a: 'null',
    "b": 1,
    'c': [ -Infinity, NaN, 'a', { null: { c: 'NaN' } } ],
    d: '\\'',
    e: "\\"",
    f: -Infinity,
  }
` )
```
