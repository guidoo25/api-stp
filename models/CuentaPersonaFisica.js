class CuentaPersonaFisica {
  constructor({ correo, empresa, firma, nombre, numeroCelular, numeroCuenta, rfc, token, usuario }) {
    this.correo = correo;
    this.empresa = empresa;
    this.firma = firma;
    this.nombre = nombre;
    this.numeroCelular = numeroCelular;
    this.numeroCuenta = numeroCuenta;
    this.rfc = rfc;
    this.token = token;
    this.usuario = usuario;
  }

  static validate(args) {
    const requiredFields = ['correo', 'empresa', 'firma', 'nombre', 'numeroCelular', 'numeroCuenta', 'rfc', 'token', 'usuario'];
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}

export default CuentaPersonaFisica;