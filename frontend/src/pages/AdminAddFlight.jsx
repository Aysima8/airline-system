import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminAddFlight.css';

function AdminAddFlight() {
  const navigate = useNavigate();
  const [flightData, setFlightData] = useState({
    flightNumber: '',
    airline: 'Turkish Airlines',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: 180,
    availableSeats: 180,
    basePrice: 500
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/v1/admin/flights', flightData);
      setMessage({ type: 'success', text: 'Uçuş başarıyla eklendi!' });

      // Form'u temizle
      setTimeout(() => {
        setFlightData({
          flightNumber: '',
          airline: 'Turkish Airlines',
          origin: '',
          destination: '',
          departureTime: '',
          arrivalTime: '',
          totalSeats: 180,
          availableSeats: 180,
          basePrice: 500
        });
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Uçuş eklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-flight">
      <div className="admin-container">
        <h1>🛫 Yeni Uçuş Ekle</h1>
        <p className="subtitle">Admin Panel - Uçuş Ekleme</p>

        <form onSubmit={handleSubmit} className="flight-form">
          <div className="form-row">
            <div className="form-group">
              <label>Uçuş Numarası</label>
              <input
                type="text"
                placeholder="TK1234"
                value={flightData.flightNumber}
                onChange={(e) => setFlightData({ ...flightData, flightNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Havayolu</label>
              <select
                value={flightData.airline}
                onChange={(e) => setFlightData({ ...flightData, airline: e.target.value })}
                required
              >
                <option value="Turkish Airlines">Turkish Airlines</option>
                <option value="Pegasus">Pegasus</option>
                <option value="AnadoluJet">AnadoluJet</option>
                <option value="SunExpress">SunExpress</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kalkış (IATA Kodu)</label>
              <input
                type="text"
                placeholder="IST"
                maxLength="3"
                value={flightData.origin}
                onChange={(e) => setFlightData({ ...flightData, origin: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="form-group">
              <label>Varış (IATA Kodu)</label>
              <input
                type="text"
                placeholder="AYT"
                maxLength="3"
                value={flightData.destination}
                onChange={(e) => setFlightData({ ...flightData, destination: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kalkış Zamanı</label>
              <input
                type="datetime-local"
                value={flightData.departureTime}
                onChange={(e) => setFlightData({ ...flightData, departureTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Varış Zamanı</label>
              <input
                type="datetime-local"
                value={flightData.arrivalTime}
                onChange={(e) => setFlightData({ ...flightData, arrivalTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Toplam Koltuk</label>
              <input
                type="number"
                min="1"
                max="500"
                value={flightData.totalSeats}
                onChange={(e) => setFlightData({
                  ...flightData,
                  totalSeats: parseInt(e.target.value),
                  availableSeats: parseInt(e.target.value)
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Müsait Koltuk</label>
              <input
                type="number"
                min="0"
                max={flightData.totalSeats}
                value={flightData.availableSeats}
                onChange={(e) => setFlightData({ ...flightData, availableSeats: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Baz Fiyat (₺)</label>
              <input
                type="number"
                min="100"
                step="10"
                value={flightData.basePrice}
                onChange={(e) => setFlightData({ ...flightData, basePrice: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn-cancel">
              İptal
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Uçuş Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAddFlight;
