import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function BuyTicket() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [flight, setFlight] = useState(location.state?.flight || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [paymentType, setPaymentType] = useState('CARD');
  const [memberNo, setMemberNo] = useState('');

  const [passengerData, setPassengerData] = useState({
    firstName: '',
    lastName: '',
    passportNo: '',
    nationality: 'TR'
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!flight) {
      navigate('/');
      return;
    }
  }, [user, flight, navigate]);

  const handlePassengerChange = (e) => {
    setPassengerData({
      ...passengerData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        flightId: flight.id,
        passengers: [passengerData],
        paymentType: paymentType
      };

      if (paymentType === 'CARD') {
        payload.paymentInfo = paymentData;
      }

      if (memberNo) {
        payload.memberNo = memberNo;
      }

      await api.post('/tickets/buy', payload);

      alert('Bilet başarıyla satın alındı! 🎉');
      navigate('/my-tickets');
    } catch (err) {
      setError(err.response?.data?.message || 'Bilet satın alınamadı');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) {
    return (
      <div className="container">
        <div className="alert alert-error">Uçuş bilgisi bulunamadı</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container">
      <h1>Bilet Satın Al</h1>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Flight Info */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Uçuş Bilgileri</h2>
        <p><strong>Uçuş:</strong> {flight.flightNumber}</p>
        <p><strong>Rota:</strong> {flight.origin} → {flight.destination}</p>
        <p><strong>Kalkış:</strong> {formatDate(flight.departureTime)}</p>
        <p><strong>Varış:</strong> {formatDate(flight.arrivalTime)}</p>
        <p><strong>Fiyat:</strong> {flight.price || flight.basePrice} TL</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Passenger Info */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>Yolcu Bilgileri</h2>

          <div className="form-group">
            <label htmlFor="firstName">Ad *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={passengerData.firstName}
              onChange={handlePassengerChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Soyad *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={passengerData.lastName}
              onChange={handlePassengerChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="passportNo">Pasaport No *</label>
            <input
              type="text"
              id="passportNo"
              name="passportNo"
              value={passengerData.passportNo}
              onChange={handlePassengerChange}
              placeholder="ABC123456"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nationality">Uyruk *</label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={passengerData.nationality}
              onChange={handlePassengerChange}
              placeholder="TR"
              maxLength={2}
              required
            />
          </div>
        </div>

        {/* Payment Type Selection */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>Ödeme Yöntemi</h2>

          <div className="form-group">
            <label>
              <input
                type="radio"
                name="paymentType"
                value="CARD"
                checked={paymentType === 'CARD'}
                onChange={(e) => setPaymentType(e.target.value)}
              />
              {' '}Kredi Kartı
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input
                type="radio"
                name="paymentType"
                value="MILES"
                checked={paymentType === 'MILES'}
                onChange={(e) => setPaymentType(e.target.value)}
              />
              {' '}Miles & Smiles
            </label>
          </div>

          {/* Miles & Smiles Member Number */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="memberNo">Miles & Smiles Üye No (Opsiyonel)</label>
            <input
              type="text"
              id="memberNo"
              name="memberNo"
              value={memberNo}
              onChange={(e) => setMemberNo(e.target.value)}
              placeholder="MS1234567890"
            />
            <small style={{ color: '#666' }}>
              CARD ödemede mil kazanmak veya MILES ile ödeme için gerekli
            </small>
          </div>
        </div>

        {/* Payment Info - Only for CARD */}
        {paymentType === 'CARD' && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>Kart Bilgileri</h2>

          <div className="form-group">
            <label htmlFor="cardNumber">Kart Numarası *</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handlePaymentChange}
              placeholder="1234567890123456"
              maxLength={16}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardHolder">Kart Sahibi *</label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={paymentData.cardHolder}
              onChange={handlePaymentChange}
              placeholder="JOHN DOE"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="expiryDate">Son Kullanma *</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={handlePaymentChange}
                placeholder="12/25"
                maxLength={5}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV *</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentData.cvv}
                onChange={handlePaymentChange}
                placeholder="123"
                maxLength={3}
                required
              />
            </div>
          </div>

            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
              * Bu demo uygulamadır. Gerçek ödeme işlemi yapılmamaktadır.
            </p>
          </div>
        )}

        {/* Miles Payment Info */}
        {paymentType === 'MILES' && (
          <div className="card" style={{ marginBottom: '2rem', background: '#f0f7ff', border: '2px solid #667eea' }}>
            <h2>Miles & Smiles ile Ödeme</h2>
            <p style={{ color: '#667eea', fontWeight: '600' }}>
              ✈️ Bu uçuş için Miles & Smiles puanlarınız kullanılacaktır.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
              Hesaplama: 1 mil = 10 TL
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : 'Satın Al'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BuyTicket;
