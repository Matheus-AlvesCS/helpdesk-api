export class AppError {
  errorMessage: string
  statusCode: number

  constructor(message: string, statusCode: number = 400) {
    this.errorMessage = message
    this.statusCode = statusCode
  }
}
