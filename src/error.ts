
// 400 Bad Request
export class BadRequestError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, Error.prototype);
    }
    code = 400;
}

// 404 Not Found
export class NotFoundError extends Error {
  constructor(m: string) {
      super(m);
      Object.setPrototypeOf(this, Error.prototype);
  }
  code = 404;
}
