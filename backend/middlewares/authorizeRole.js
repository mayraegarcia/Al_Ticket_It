
import { ForbiddenError, UnauthorizedError } from "../error/AppError.js";

export function authorizeRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Debés iniciar sesión para realizar esta acción"
      );
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      throw new ForbiddenError(
        "No tenés permisos para realizar esta acción"
      );
    }

    next();
  };
}
