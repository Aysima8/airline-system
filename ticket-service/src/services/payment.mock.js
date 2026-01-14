// Gerçek ödeme YOK - Mock ödeme servisi

class PaymentMock {
  async processPayment(paymentInfo) {
    // Simüle edilmiş ödeme işlemi
    return new Promise((resolve) => {
      setTimeout(() => {
        // %95 başarı oranı
        const success = Math.random() > 0.05;

        resolve({
          success,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount: paymentInfo.amount,
          timestamp: new Date()
        });
      }, 1000); // 1 saniye bekleme
    });
  }

  async refund(transactionId, amount) {
    // Simüle edilmiş iade işlemi
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          refundId: `RFD-${Date.now()}`,
          transactionId,
          amount,
          timestamp: new Date()
        });
      }, 500);
    });
  }
}

module.exports = new PaymentMock();
