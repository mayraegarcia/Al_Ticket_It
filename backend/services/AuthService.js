

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { Usuario } from "../domain/Usuario.js";
import { RolUsuario } from "../domain/RolUsuario.js";

import {
  BadRequestError,
  ConflictError,
  UnauthorizedError
} from "../error/AppError.js";

export class AuthService {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  async registrar(datos) {
    const { nombre, apellido, email, password, rol = RolUsuario.COMPRADOR } = datos;

    if (!nombre || !apellido || !email || !password) {
      throw new BadRequestError(
        "Nombre, apellido, email y contraseña son obligatorios"
      );
    }

    if (password.length < 6) {
      throw new BadRequestError(
        "La contraseña debe tener al menos 6 caracteres"
      );
    }

    if (!Object.values(RolUsuario).includes(rol)) {
      throw new BadRequestError("Rol inválido");
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existente = this.usuarioRepository.obtenerPorEmail(emailNormalizado);

    if (existente) {
      throw new ConflictError("Ya existe un usuario con ese email");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuarios = this.usuarioRepository.obtenerTodos();

    const nuevoId = usuarios.length === 0
      ? 1
      : Math.max(...usuarios.map(usuario => usuario.id)) + 1;

    const usuario = new Usuario({
      id: nuevoId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      passwordHash,
      roles: [rol],
      favoritos: []
    });

    const usuarioGuardado = this.usuarioRepository.guardar(usuario);

    const token = this.generarToken(usuarioGuardado, rol);

    return {
      token,
      usuario: this.datosPublicos(usuarioGuardado, rol)
    };
  }

  async login(email, password, rol) {
    if (!email || !password) {
      throw new BadRequestError("Email y contraseña son obligatorios");
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = this.usuarioRepository.obtenerPorEmail(emailNormalizado);

    if (!usuario) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.passwordHash
    );

    if (!passwordValida) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const rolSeleccionado = rol || usuario.roles[0];

    if (!usuario.roles.includes(rolSeleccionado)) {
      throw new UnauthorizedError("El usuario no tiene ese rol");
    }

    const token = this.generarToken(usuario, rolSeleccionado);

    return {
      token,
      usuario: this.datosPublicos(usuario, rolSeleccionado)
    };
  }

  generarToken(usuario, rol) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET no está configurado");
    }

    return jwt.sign(
      {
        id: usuario.id,
        rol
      },
      secret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );
  }

  datosPublicos(usuario, rol) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol
    };
  }
}
