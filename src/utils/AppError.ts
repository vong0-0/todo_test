class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public errorCode: string | undefined;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
