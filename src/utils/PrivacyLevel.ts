/**
 * Nivel de Privacidad de la app:
 * - PUBLIC - *Abierta para todos los miembros de la locación*
 * - SELECTED - *Solo disponible para los miembros de la locación que posean al menos una de las posiciones indicadas*
 * - PRIVATE - *Solo disponible para los miembros (**members**) seleccionados*
 */
export enum PrivacyLevel {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  POSITIONS = "POSITIONS",
}
