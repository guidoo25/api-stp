import crypto from 'crypto';

export class Abono {
  constructor(data) {
    // Campos obligatorios
    this.empresa = data.empresa;
    this.fechaOperacion = data.fechaOperacion;
    this.folioOrigen = data.folioOrigen;
    this.claveRastreo = data.claveRastreo;
    this.institucionOperante = data.institucionOperante;
    this.monto = data.monto;
    this.tipoPago = data.tipoPago;
    this.tipoCuentaBeneficiario = data.tipoCuentaBeneficiario;
    this.nombreBeneficiario = data.nombreBeneficiario;
    this.cuentaBeneficiario = data.cuentaBeneficiario;
    this.rfcCurpBeneficiario = data.rfcCurpBeneficiario;
    this.conceptoPago = data.conceptoPago;
    this.referenciaNumerica = data.referenciaNumerica;
    this.topologia = data.topologia;
    this.usuario = data.usuario;
    this.medioEntrega = data.medioEntrega;
    this.prioridad = data.prioridad;

    // Campos opcionales
    this.claveRastreoDevolucion = data.claveRastreoDevolucion || '';
    this.tipoCuentaOrdenante = data.tipoCuentaOrdenante || '';
    this.nombreOrdenante = data.nombreOrdenante || '';
    this.cuentaOrdenante = data.cuentaOrdenante || '';
    this.rfcCurpOrdenante = data.rfcCurpOrdenante || '';
    this.emailBeneficiario = data.emailBeneficiario || '';
    this.claveCatUsuario1 = data.claveCatUsuario1 || '';
    this.claveCatUsuario2 = data.claveCatUsuario2 || '';
    this.clavePago = data.clavePago || '';
    this.referenciaCobranza = data.referenciaCobranza || '';
    this.tipoOperacion = data.tipoOperacion || '';

    // Generar la firma
    this.firma = this.generarFirma();
  }

  generarFirma() {
    const cadenaOriginal = this.empresa + this.fechaOperacion + this.folioOrigen + 
      this.claveRastreo + this.institucionOperante + this.monto + this.tipoPago + 
      this.tipoCuentaBeneficiario + this.nombreBeneficiario + this.cuentaBeneficiario + 
      this.rfcCurpBeneficiario + this.conceptoPago + this.referenciaNumerica + 
      this.topologia + this.usuario + this.medioEntrega + this.prioridad + 
      this.claveRastreoDevolucion + this.tipoCuentaOrdenante + this.nombreOrdenante + 
      this.cuentaOrdenante + this.rfcCurpOrdenante + this.emailBeneficiario + 
      this.claveCatUsuario1 + this.claveCatUsuario2 + this.clavePago + 
      this.referenciaCobranza + this.tipoOperacion;

    const hash = crypto.createHash('sha256');
    hash.update(cadenaOriginal);
    return hash.digest('base64');
  }

  toSoapFormat() {
    return {
      abono: {
        ...this
      }
    };
  }
}