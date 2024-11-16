interface IException {
  statusCode: number

  toJSON(): {
    statusCode: number
    message: string
  }
}

export { IException }
