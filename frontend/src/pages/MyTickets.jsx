import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchTickets();
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/user');
      setTickets(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Biletler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Bu bileti iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/tickets/${ticketId}`);
      alert('Bilet iptal edildi');
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Bilet iptal edilemedi');
    }
  };

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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Biletler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Biletlerim</h1>

      {tickets.length === 0 ? (
        <div className="alert alert-info" style={{ background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' }}>
          Henüz biletiniz bulunmuyor.
        </div>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Uçuş: {ticket.flight?.flightNumber || 'N/A'}
                  </h3>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Rota:</strong> {ticket.flight?.origin} → {ticket.flight?.destination}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Kalkış:</strong> {ticket.flight?.departureTime ? formatDate(ticket.flight.departureTime) : 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Yolcu:</strong> {ticket.passengerName || 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Koltuk:</strong> {ticket.seatNumber || 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>PNR:</strong> {ticket.pnr || ticket.id}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Fiyat:</strong> {ticket.price} TL
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Durum:</strong>{' '}
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: ticket.status === 'confirmed' ? '#d4edda' : ticket.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                      color: ticket.status === 'confirmed' ? '#155724' : ticket.status === 'cancelled' ? '#721c24' : '#856404'
                    }}>
                      {ticket.status === 'confirmed' ? 'Onaylı' : ticket.status === 'cancelled' ? 'İptal' : ticket.status}
                    </span>
                  </p>
                </div>

                {ticket.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelTicket(ticket.id)}
                    className="btn btn-secondary"
                    style={{ background: '#dc3545' }}
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
