export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);

    this.name = this.constructor.name;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}