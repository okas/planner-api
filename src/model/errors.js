import { MyBaseError } from '../common/errors'

export class ValidationErrors extends MyBaseError {
  /**
   * @param {string} message
   * @param {string[]} errors
   */
  constructor(message, errors) {
    super(message)
    this.errors = errors
  }
}

/**
 * @template T
 */
export class ExistingDocumentError extends ValidationErrors {
  /**
   * @param {string} message
   * @param {T} existing
   * @param {string[]} errors
   */
  constructor(message, existing, errors) {
    super(message, errors)
    this.existing = existing
  }
}
