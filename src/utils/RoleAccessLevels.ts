/**
 * Roles jerárquicos dentro de una locación:
 * - PRIMARY_OWNER - *Dueño de la locación, solo hay uno y puede formar parte o no de la plantilla de empleados.*
 * - GENERAL_MANAGER - *Gerente general de la locación, puede haber más de uno y poseen la mayoría de permisos dentro de una locación mientras estos no interfieran con la locación en sí*
 * - RESTAURANT_MANAGER - *Manager, estos son los encargados de más bajo nivel, pueden ser asignados como host de apps y editar horarios, así como añadir trabajadores de la categoría básica*
 * - RESTAURANT_STAFF - *Miembros del equipo de trabajadores, estos son los empleados normales de una locación y sirven como clientes de solo uso/lectura en la mayoría de apps, tienen acceso a chats y conversaciones*
 */
export enum RoleAccessLevels {
  OWNER = 0,
  ADMIN = 1,
  GENERAL_MANAGER = 2,
  MANAGER = 3,
  STAFF = 4,
}

/**
 * Reliza una comparación entre los roles de dos usuarios y verifica que el primero tenga permisos sobre el segundo.
 * @param {RoleAccessLevels} userRole Rol del usuario que está llamando la función
 * @param {RoleAccessLevels} employeeRole Rol del usuario con el cuál se quiere comparar el rol
 * @returns {boolean} Devuelve *true* si en usuario que realizó la comparación tiene permisos (rango superior) sobre el empleado en cuestión, en caso contrario devuelve *false*
 */
export const CompareRoles = (
  userRole: RoleAccessLevels,
  employeeRole: RoleAccessLevels
) => {
  return userRole < employeeRole;
};
