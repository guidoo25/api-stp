const Estado = {
  Succeeded: 'succeeded',
  Rejected: 'rejected',
  Error: 'error'
};

const EventType = {
  Created: 'created',
  Completed: 'completed',
  Error: 'error'
};

const Event = {
  id: undefined,
  transactionId: '',
  type: EventType.Created,
  metadata: undefined,
  createdAt: undefined
};

class Transaction {
  constructor() {
    this.id = '';
    this.fechaOperacion = new Date();
    this.institucionContraparte = '';
    this.institucionOperante = '';
    this.claveRastreo = '';
    this.monto = 0;
    this.nombreOrdenante = '';
    this.tipoCuentaOrdenante = '';
    this.cuentaOrdenante = '';
    this.rfcCurpOrdenante = '';
    this.nombreBeneficiario = '';
    this.tipoCuentaBeneficiario = '';
    this.cuentaBeneficiario = '';
    this.rfcCurpBeneficiario = '';
    this.conceptoPago = '';
    this.referenciaNumerica = 0;
    this.empresa = '';
    this.estado = Estado.Succeeded;
    this.events = [];
    this.createdAt = new Date();
  }
}

export {
  Estado,
  EventType,
  Event,
  Transaction
};