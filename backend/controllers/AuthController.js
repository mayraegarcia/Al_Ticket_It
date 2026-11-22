import { AuthService } from "../services/AuthService.js";

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  registrar = async (req, res, next) => {
    try {
      const resultado = await this.authService.registrar(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password, rol } = req.body;

      const resultado = await this.authService.login(
        email,
        password,
        rol
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();