import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class OrdenPago {
  constructor(data) {
    this.empresa = data.empresa;
    this.monto = data.monto;
    this.claveRastreo = data.claveRastreo;
    this.conceptoPago = data.conceptoPago;
    this.cuentaBeneficiario = data.cuentaBeneficiario;
    this.institucionContraparte = data.institucionContraparte;
    this.institucionOperante = data.institucionOperante;
    this.nombreBeneficiario = data.nombreBeneficiario;
    this.referenciaNumerica = data.referenciaNumerica;
    this.tipoCuentaBeneficiario = data.tipoCuentaBeneficiario;
    this.cuentaOrdenante = data.cuentaOrdenante;
    this.rfcCurpBeneficiario = data.rfcCurpBeneficiario;
    this.tipoPago = data.tipoPago;
    this.topologia = data.topologia;
    this.fechaOperacion = data.fechaOperacion;

    this.nombreOrdenante = data.nombreOrdenante;
    this.rfcCurpOrdenante = data.rfcCurpOrdenante;
    this.tipoCuentaOrdenante = data.tipoCuentaOrdenante;

    this.firma = null;
  }

  async generarFirma() {
    try {
      const keyPath = path.resolve(process.cwd(), 'ssl', 'key.pem');
      const key = await fs.readFile(keyPath, 'utf8');
      const passphrase = 'admin12345'; 

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(this.generarCadenaOriginal());
      this.firma = sign.sign({ key, passphrase }, 'base64');
    } catch (error) {
      console.error('Error al generar la firma:', error);
      throw new Error('No se pudo generar la firma');
    }
  }

  generarCadenaOriginal() {
    const campos = [
      this.empresa,
      this.fechaOperacion,
      this.claveRastreo,
      this.institucionOperante,
      this.monto,
      this.tipoPago,
      this.tipoCuentaBeneficiario,
      this.nombreBeneficiario,
      this.cuentaBeneficiario,
      this.rfcCurpBeneficiario,
      this.conceptoPago,
      this.referenciaNumerica,
      this.topologia
    ];

    return campos.map(campo => campo || '').join('|');
  }
}