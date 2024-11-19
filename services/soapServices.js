import soap from 'soap';

export class SoapService {
  constructor(url) {
    this.url = url;
    this.client = null;
    this.lastRequest = null;
  }

  async initializeClient() {
    if (!this.client) {
      try {
        this.client = await soap.createClientAsync(this.url);
        console.log('SOAP client initialized successfully.');
      } catch (error) {
        console.error('Error initializing SOAP client:', error);
        throw error;
      }
    }
  }

  async registraOrden(orden) {
    await this.initializeClient();
    const args = { ordenPago: orden.toSoapFormat().ordenPago };
    console.log('SOAP request arguments:', args);

    try {
      const [result] = await this.client.registraOrdenAsync(args);
      this.lastRequest = this.client.lastRequest;
      console.log('SOAP request:', this.lastRequest);
      console.log('SOAP response:', result);
      return result;
    } catch (error) {
      console.error('Error in SOAP request:', error);
      throw error;
    }
  }

  async sendAbono(abono) {
    await this.initializeClient();
    const args = abono.toSoapFormat();
    console.log('SOAP request arguments:', JSON.stringify(args, null, 2));

    try {
      const [result] = await this.client.sendAbonoAsync(args);
      this.lastRequest = this.client.lastRequest;
      console.log('SOAP request:', this.lastRequest);
      console.log('SOAP response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error in SOAP request:', error);
      throw error;
    }
  }

  formatAbonoForSoap(abono) {
    return {
      id: abono.id,
      fechaOperacion: abono.fechaOperacion,
      institucionOrdenante: abono.institucionOrdenante,
      institucionBeneficiaria: abono.institucionBeneficiaria,
      claveRastreo: abono.claveRastreo,
      monto: abono.monto,
      nombreOrdenante: abono.nombreOrdenante,
      tipoCuentaOrdenante: abono.tipoCuentaOrdenante,
      cuentaOrdenante: abono.cuentaOrdenante,
      rfcCurpOrdenante: abono.rfcCurpOrdenante,
      nombreBeneficiario: abono.nombreBeneficiario,
      tipoCuentaBeneficiario: abono.tipoCuentaBeneficiario,
      cuentaBeneficiario: abono.cuentaBeneficiario,
      nombreBeneficiario2: abono.nombreBeneficiario2,
      tipoCuentaBeneficiario2: abono.tipoCuentaBeneficiario2,
      cuentaBeneficiario2: abono.cuentaBeneficiario2,
      rfcCurpBeneficiario: abono.rfcCurpBeneficiario,
      conceptoPago: abono.conceptoPago,
      referenciaNumerica: abono.referenciaNumerica,
      empresa: abono.empresa,
      tipoPago: abono.tipoPago,
      tsLiquidacion: abono.tsLiquidacion,
      folioCodi: abono.folioCodi
    };
  }
}