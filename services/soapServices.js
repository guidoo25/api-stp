import soap from 'soap';

class SoapService {
  constructor(url) {
    this.url = url;
    this.client = null;
  }

  async initializeClient() {
    if (!this.client) {
      this.client = await soap.createClientAsync(this.url);
    }
  }

  async registraOrden(ordenPago) {
    await this.initializeClient();
    const args = ordenPago.toSoapFormat();
    return await this.client.registraOrdenAsync(args);
  }

  async sendAbono(abono) {
    await this.initializeClient();
    const args = abono.toSoapFormat();
    return await this.client.sendAbonoAsync(args);
  }

}

export default SoapService;
export { SoapService };