import crypto from 'crypto';
import fs from 'fs/promises';
import { PRIVATE_KEY_PATH, PRIVATE_KEY_PASSPHRASE } from '../config/config.js';

export class OrdenPago {
  constructor(data) {
    this.claveRastreo = data.claveRastreo;
    this.conceptoPago = data.conceptoPago;
    this.cuentaOrdenante = data.cuentaOrdenante;
    this.cuentaBeneficiario = data.cuentaBeneficiario;
    this.empresa = 'CEDI'; // Nombre comercial fijo
    this.institucionContraparte = data.institucionContraparte;
    this.institucionOperante = data.institucionOperante;
    this.monto = data.monto.toFixed(2); // Formato 20.00
    this.nombreBeneficiario = data.nombreBeneficiario;
    this.referenciaNumerica = data.referenciaNumerica;
    this.rfcCurpBeneficiario = data.rfcCurpBeneficiario || 'ND';
    this.rfcCurpOrdenante = data.rfcCurpOrdenante || 'ND';
    this.tipoCuentaBeneficiario = data.tipoCuentaBeneficiario;
    this.tipoCuentaOrdenante = data.tipoCuentaOrdenante;
    this.tipoPago = data.tipoPago;
    this.latitud = data.latitud;
    this.longitud = data.longitud;
    this.firma = null;
  }

  async generarFirma() {
    try {
      const cadenaOriginal = this.generarCadenaOriginal();
      console.log('Cadena Original:', cadenaOriginal);
      const privateKey = await fs.readFile(PRIVATE_KEY_PATH, 'utf8');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(cadenaOriginal);
      this.firma = sign.sign({ key: privateKey, passphrase: PRIVATE_KEY_PASSPHRASE }, 'base64');
      console.log('Firma:', this.firma);
    } catch (error) {
      console.error('Error generating signature:', error);
      throw error;
    }
  }

  generarCadenaOriginal() {
    const orderKeys = [
      'institucionContraparte',
      'empresa',
      'fechaOperacion',
      'folioOrigen',
      'claveRastreo',
      'institucionOperante',
      'monto',
      'tipoPago',
      'tipoCuentaOrdenante',
      'nombreOrdenante',
      'cuentaOrdenante',
      'rfcCurpOrdenante',
      'tipoCuentaBeneficiario',
      'nombreBeneficiario',
      'cuentaBeneficiario',
      'rfcCurpBeneficiario',
      'emailBeneficiario',
      'tipoCuentaBeneficiario2',
      'nombreBeneficiario2',
      'cuentaBeneficiario2',
      'rfcCurpBeneficiario2',
      'conceptoPago',
      'conceptoPago2',
      'claveCatUsuario1',
      'claveCatUsuario2',
      'clavePago',
      'referenciaCobranza',
      'referenciaNumerica',
      'tipoOperacion',
      'topologia',
      'usuario',
      'medioEntrega',
      'prioridad',
      'iva'
    ];

    let originalString = '||';

    for (const key of orderKeys) {
      let value = this[key] || '';
      value = value.toString().trim();
      originalString += `${value}|`;
    }

    originalString += '|';
    return originalString;
  }

  toSoapFormat() {
    return {
      ordenPago: {
        claveRastreo: this.claveRastreo,
        conceptoPago: this.conceptoPago,
        cuentaOrdenante: this.cuentaOrdenante,
        cuentaBeneficiario: this.cuentaBeneficiario,
        empresa: this.empresa,
        institucionContraparte: this.institucionContraparte,
        institucionOperante: this.institucionOperante,
        monto: this.monto,
        nombreBeneficiario: this.nombreBeneficiario,
        referenciaNumerica: this.referenciaNumerica,
        rfcCurpBeneficiario: this.rfcCurpBeneficiario,
        rfcCurpOrdenante: this.rfcCurpOrdenante,
        tipoCuentaBeneficiario: this.tipoCuentaBeneficiario,
        tipoCuentaOrdenante: this.tipoCuentaOrdenante,
        tipoPago: this.tipoPago,
        latitud: this.latitud,
        longitud: this.longitud,
        firma: this.firma
      }
    };
  }
}