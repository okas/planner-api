export class MyBaseError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}
