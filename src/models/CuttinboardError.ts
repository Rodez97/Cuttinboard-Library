export class CuttinboardError extends Error {
  message: string;
  code: string;

  constructor(code: string, message?: string) {
    const fullMsg = message ? `${code}: ${message}` : code;
    super(fullMsg);
    this.code = code;
    this.message = fullMsg;
  }

  toString() {
    return this.message;
  }
}
