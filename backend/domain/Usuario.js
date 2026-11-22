

export class Usuario {
  constructor({
    id,
    nombre,
    apellido,
    email,
    passwordHash,
    roles = [],
    favoritos = []
  }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.favoritos = favoritos;
  }
}
