// @flow

export default {
  // eof
  EOF: Symbol( 'EOF' ),
  // comment
  COMMENT: Symbol( 'COMMENT' ),
  // ,
  COMMA: Symbol( 'COMMA' ),
  // :
  COLON: Symbol( 'COLON' ),
  // string
  // '' | ""
  STRING: Symbol( 'STRING' ),
  // number
  NUMBER: Symbol( 'NUMBER' ),
  // [
  ARRAY_START: Symbol( 'ARRAY_START' ),
  // ]
  ARRAY_END: Symbol( 'ARRAY_END' ),
  // {
  OBJECT_START: Symbol( 'OBJECT_START' ),
  // }
  OBJECT_END: Symbol( 'OBJECT_END' ),
  // <ident>
  // null or key without quotes
  IDENT: Symbol( 'IDENT' ),
  // \s
  WHITESPACE: Symbol( 'WHITESPACE' ),
  // <unknown>
  UNKNOWN: Symbol( 'UNKNOWN' ),
}
