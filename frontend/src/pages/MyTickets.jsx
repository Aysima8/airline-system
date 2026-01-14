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
          Henuz biletiniz bulunmuyor.
        </div>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card" style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  {/* Header - PNR ve Durum */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>PNR Kodu</span>
                      <h2 style={{ margin: 0, color: '#1e3c72', letterSpacing: '2px' }}>{ticket.pnr || ticket.id?.substring(0, 6).toUpperCase()}</h2>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      background: ticket.status === 'confirmed' ? '#d4edda' : ticket.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                      color: ticket.status === 'confirmed' ? '#155724' : ticket.status === 'cancelled' ? '#721c24' : '#856404'
                    }}>
                      {ticket.status === 'confirmed' ? 'Onayli' : ticket.status === 'cancelled' ? 'Iptal Edildi' : ticket.status}
                    </span>
                  </div>

                  {/* Ucus Bilgileri */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Ucus No</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>
                        {ticket.flight?.flightNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Havayolu</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>
                        {ticket.flight?.airline || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Rota */}
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3c72' }}>
                          {ticket.flight?.origin || 'N/A'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Kalkis</p>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
                        <div style={{ height: '2px', background: '#1e3c72', flex: 1 }}></div>
                        <span style={{ margin: '0 0.5rem', fontSize: '1.2rem' }}>✈</span>
                        <div style={{ height: '2px', background: '#1e3c72', flex: 1 }}></div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3c72' }}>
                          {ticket.flight?.destination || 'N/A'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Varis</p>
                      </div>
                    </div>
                  </div>

                  {/* Tarih ve Saat */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Kalkis Zamani</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#1e3c72' }}>
                        {ticket.flight?.departureTime ? new Date(ticket.flight.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                        {ticket.flight?.departureTime ? new Date(ticket.flight.departureTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Yolculuk Suresi</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#667eea' }}>
                        {ticket.flight?.duration ? `${Math.floor(ticket.flight.duration)}s ${Math.round((ticket.flight.duration % 1) * 60)}dk` : 'N/A'}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: '#999' }}>Direkt Ucus</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Varis Zamani</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#1e3c72' }}>
                        {ticket.flight?.arrivalTime ? new Date(ticket.flight.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                        {ticket.flight?.arrivalTime ? new Date(ticket.flight.arrivalTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>

                  {/* Yolcu Bilgileri */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Yolcu</p>
                      <p style={{ margin: 0, fontWeight: '500' }}>{ticket.passengerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Yolcu Sayisi</p>
                      <p style={{ margin: 0, fontWeight: '500' }}>{ticket.passengerCount || 1} Kisi</p>
                    </div>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Odeme Tipi</p>
                      <p style={{ margin: 0, fontWeight: '500' }}>
                        {ticket.paymentType === 'CARD' ? 'Kredi Karti' : 'Miles'}
                      </p>
                    </div>
                  </div>

                  {/* Fiyat ve Miles */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Toplam Tutar</p>
                      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3c72' }}>
                        {ticket.price || ticket.totalPrice} TL
                      </p>
                    </div>
                    {ticket.milesEarned > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Kazanilan Miles</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                          +{ticket.milesEarned} Mil
                        </p>
                      </div>
                    )}
                    {ticket.milesUsed > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Kullanilan Miles</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                          -{ticket.milesUsed} Mil
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {ticket.status === 'confirmed' && (
                  <div style={{ marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
                      className="btn btn-secondary"
                      style={{ background: '#dc3545', whiteSpace: 'nowrap' }}
                    >
                      Iptal Et
                    </button>
                  </div>
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
