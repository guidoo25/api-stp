CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  fechaOperacion DATE NOT NULL,
  institucionContraparte VARCHAR(5) NOT NULL,
  institucionOperante VARCHAR(5) NOT NULL,
  claveRastreo VARCHAR(30) NOT NULL,
  monto DECIMAL(15, 2) NOT NULL,
  nombreOrdenante VARCHAR(120),
  tipoCuentaOrdenante VARCHAR(2),
  cuentaOrdenante VARCHAR(20),
  rfcCurpOrdenante VARCHAR(18),
  nombreBeneficiario VARCHAR(120) NOT NULL,
  tipoCuentaBeneficiario VARCHAR(2) NOT NULL,
  cuentaBeneficiario VARCHAR(20) NOT NULL,
  rfcCurpBeneficiario VARCHAR(18) DEFAULT 'NA',
  conceptoPago VARCHAR(40) NOT NULL,
  referenciaNumerica INT NOT NULL,
  empresa VARCHAR(15) NOT NULL,
  estado ENUM('succeeded', 'rejected', 'error') DEFAULT 'succeeded',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transactionId VARCHAR(255),
  type ENUM('created', 'completed', 'error') NOT NULL,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionId) REFERENCES transactions(id)
);