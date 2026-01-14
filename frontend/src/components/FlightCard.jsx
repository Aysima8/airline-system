import React from 'react';
import './FlightCard.css';

function FlightCard({ flight, onBuy }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="airline-info">
          <h3>{flight.airline}</h3>
          <span className="flight-number">{flight.flightNumber}</span>
        </div>
        <div className="flight-price">
          <span className="price">{flight.calculatedPrice || flight.basePrice} TL</span>
          <span className="price-label">Toplam</span>
        </div>
      </div>

      <div className="flight-route">
        <div className="route-point">
          <h4>{flight.origin}</h4>
          <p className="time">{formatTime(flight.departureTime)}</p>
          <p className="date">{formatDate(flight.departureTime)}</p>
        </div>

        <div className="route-line">
          <div className="duration">
            <span>✈️</span>
            <p>{flight.duration}h</p>
          </div>
        </div>

        <div className="route-point">
          <h4>{flight.destination}</h4>
          <p className="time">{formatTime(flight.arrivalTime)}</p>
          <p className="date">{formatDate(flight.arrivalTime)}</p>
        </div>
      </div>

      <div className="flight-details">
        <div className="detail-item">
          <span className="label">Müsait Koltuk:</span>
          <span className="value">{flight.availableSeats}</span>
        </div>
        {flight.isDirect !== undefined && (
          <div className="detail-item">
            <span className="label">Aktarma:</span>
            <span className="value">{flight.isDirect ? 'Direkt' : 'Aktarmalı'}</span>
          </div>
        )}
      </div>

      <button
        className="btn-buy"
        onClick={onBuy}
        disabled={flight.availableSeats === 0}
      >
        {flight.availableSeats === 0 ? 'Müsait Değil' : 'Satın Al'}
      </button>
    </div>
  );
}

export default FlightCard;
