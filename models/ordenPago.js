import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PRIVATE_KEY_PATH, PRIVATE_KEY_PASSPHRASE } from '../config/config.js';

export class OrdenPago {
  constructor(data) {
    this.claveRastreo = data.claveRastreo;
    this.conceptoPago = data.conceptoPago;
    this.cuentaOrdenante = data.cuentaOrdenante;
    this.cuentaBeneficiario = data.cuentaBeneficiario;
    this.empresa = data.empresa;
    this.institucionContraparte = data.institucionContraparte;
    this.institucionOperante = data.institucionOperante;
    this.monto = data.monto;
    this.nombreBeneficiario = data.nombreBeneficiario;
    this.nombreOrdenante = data.nombreOrdenante;
    this.referenciaNumerica = data.referenciaNumerica;
    this.rfcCurpBeneficiario = data.rfcCurpBeneficiario;
    this.rfcCurpOrdenante = data.rfcCurpOrdenante;
    this.tipoCuentaBeneficiario = data.tipoCuentaBeneficiario;
    this.tipoCuentaOrdenante = data.tipoCuentaOrdenante;
    this.tipoPago = data.tipoPago;
    this.latitud = data.latitud;
    this.longitud = data.longitud;
    this.emailBeneficiario = data.emailBeneficiario || '';
    this.tipoCuentaBeneficiario2 = data.tipoCuentaBeneficiario2 || '';
    this.nombreBeneficiario2 = data.nombreBeneficiario2 || '';
    this.cuentaBeneficiario2 = data.cuentaBeneficiario2 || '';
    this.rfcCurpBeneficiario2 = data.rfcCurpBeneficiario2 || '';
    this.conceptoPago2 = data.conceptoPago2 || '';
    this.claveCatUsuario1 = data.claveCatUsuario1 || '';
    this.claveCatUsuario2 = data.claveCatUsuario2 || '';
    this.clavePago = data.clavePago || '';
    this.referenciaCobranza = data.referenciaCobranza || '';
    this.tipoOperacion = data.tipoOperacion || '';
    this.topologia = data.topologia || '';
    this.usuario = data.usuario || '';
    this.medioEntrega = data.medioEntrega || '';
    this.prioridad = data.prioridad || '';
    this.iva = data.iva || '';
    this.firma = null;
  }

  async generarFirma() {
    const cadenaOriginal = this.generarCadenaOriginal();
    console.log('Cadena Original:', cadenaOriginal); // Print the original string
    console.log('Private Key Path:', PRIVATE_KEY_PATH); // Print the private key path
    const privateKey = await fs.readFile(PRIVATE_KEY_PATH, 'utf8');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(cadenaOriginal);
    this.firma = sign.sign({ key: privateKey, passphrase: PRIVATE_KEY_PASSPHRASE }, 'base64');
    console.log('Firma:', this.firma); // Print the generated signature
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
        nombreOrdenante: this.nombreOrdenante,
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