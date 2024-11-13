import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs/promises';

class STPClient {
  constructor(config) {
    this.config = config;
    this.baseURL = 'https://demo.stpmex.com:7024/speiws/rest';
  }

  async loadPrivateKey() {
    if (!this.privateKey) {
      this.privateKey = await fs.readFile(this.config.privateKeyPath, 'utf8');
    }
    return this.privateKey;
  }

  async generateSignature(data) {
    const privateKey = await this.loadPrivateKey();
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(this.generateOriginalString(data));
    return sign.sign({ key: privateKey, passphrase: this.config.privateKeyPassphrase }, 'base64');
  }

  generateOriginalString(data) {
    const fields = [
      '', '', data.institucionContraparte, data.empresa, data.fechaOperacion,
      '', data.claveRastreo, data.institucionOperante, data.monto,
      data.tipoPago, data.tipoCuentaOrdenante, data.nombreOrdenante,
      data.cuentaOrdenante, data.rfcCurpOrdenante, data.tipoCuentaBeneficiario,
      data.nombreBeneficiario, data.cuentaBeneficiario, data.rfcCurpBeneficiario,
      data.emailBeneficiario, '', '', '', '', data.conceptoPago, '',
      '', '', '', '', data.referenciaNumerica, '', data.topologia,
      '', data.medioEntrega, data.prioridad, '', '', ''
    ];
    return `||${fields.join('|')}||`;
  }

  async registraOrden(orden) {
    await this.initializeClient();
    const args = { ordenPago: orden.toSoapFormat().ordenPago };
    console.log('SOAP request arguments:', JSON.stringify(args, null, 2));

    try {
      const [result] = await this.client.registraOrdenAsync(args);
      this.lastRequest = this.client.lastRequest;
      console.log('SOAP request:', this.lastRequest);
      console.log('SOAP response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error in SOAP request:', error);
      throw error;
    }
  }
}

export default STPClient;