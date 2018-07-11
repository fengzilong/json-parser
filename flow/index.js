declare type IToken = {
  type: Symbol,
  value?: any,
  pos: Object
}

type IError = {
  message: string,
  pos?: number
}
