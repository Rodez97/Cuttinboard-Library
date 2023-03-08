/**
 * Privacy level of board.
 * - Controls the visibility of the board by the employees.
 */
export enum PrivacyLevel {
  /**
   * The board is visible to all employees.
   *
   * @example
   * ```ts
   * // All employees can see the board.
   * const board = new Board({
   *   privacyLevel: PrivacyLevel.PUBLIC
   * });
   * ```
   */
  PUBLIC = 2,
  /**
   * The board is visible to employees that have the positions specified in the board.
   *
   * @example
   * ```ts
   * // Only employees with the position "Server" can see the board.
   * const board = new Board({
   *   privacyLevel: PrivacyLevel.POSITIONS,
   *   position: "Server"
   * });
   * ```
   */
  POSITIONS = 1,
  /**
   * The board is visible to the employees that are assigned to the board.
   *
   * @example
   * ```ts
   * // Only employees assigned to the board can see it.
   * const board = new Board({
   *   privacyLevel: PrivacyLevel.PRIVATE
   * });
   * ```
   */
  PRIVATE = 0,
}

/**
 * Converts a `PrivacyLevel` enum value to a string.
 *
 * @param privacyLevel The `PrivacyLevel` value to convert.
 * @returns The string representation of the `PrivacyLevel` value.
 */
export function privacyLevelToString(privacyLevel: PrivacyLevel): string {
  switch (privacyLevel) {
    case PrivacyLevel.PUBLIC:
      return "PUBLIC";
    case PrivacyLevel.POSITIONS:
      return "POSITIONS";
    case PrivacyLevel.PRIVATE:
      return "PRIVATE";
  }
}
