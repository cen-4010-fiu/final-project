// NOTE: Could definitely be expanded upon
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(msg: string) {
    return new ApiError(400, msg);
  }
  static notFound(msg: string) {
    return new ApiError(404, msg);
  }
  static internal(msg: string) {
    return new ApiError(500, msg);
  }
}
