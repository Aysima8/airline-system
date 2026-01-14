import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FlightCard from '../components/FlightCard';
import './SearchFlights.css';

function SearchFlights() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    flex: 0,
    direct: false
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tarih formatını normalize et: "21.01.2026" -> "2026-01-21"
  const normalizeDate = (d) => {
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) {
      const [dd, mm, yyyy] = d.split('.');
      return `${yyyy}-${mm}-${dd}`;
    }
    return d; // zaten "YYYY-MM-DD" ise dokunma
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = {
        from: searchParams.origin,
        to: searchParams.destination,
        date: normalizeDate(searchParams.date),
        pax: searchParams.passengers,
        flex: searchParams.flex,
        direct: searchParams.direct ? 'true' : 'false'
      };

      const response = await api.get('/flights/search', { params });

      setFlights(response.data.data);

      if (response.data.data.length === 0) {
        setError('Aramanıza uygun uçuş bulunamadı.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Uçuş arama hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = (flight) => {
    navigate('/buy-ticket', { state: { flight, passengers: searchParams.passengers } });
  };

  return (
    <div className="search-flights">
      <div className="search-container">
        <h1>✈️ Uçuş Ara</h1>

        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Nereden</label>
            <input
              type="text"
              placeholder="IST"
              value={searchParams.origin}
              onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Nereye</label>
            <input
              type="text"
              placeholder="AYT"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Tarih</label>
            <input
              type="date"
              value={searchParams.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Yolcu Sayısı</label>
            <input
              type="number"
              min="1"
              max="9"
              value={searchParams.passengers}
              onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>Esnek Gün (±)</label>
            <select
              value={searchParams.flex}
              onChange={(e) => setSearchParams({ ...searchParams, flex: parseInt(e.target.value) })}
            >
              <option value="0">Sadece bu tarih</option>
              <option value="1">± 1 gün</option>
              <option value="2">± 2 gün</option>
              <option value="3">± 3 gün</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={searchParams.direct}
                onChange={(e) => setSearchParams({ ...searchParams, direct: e.target.checked })}
              />
              Sadece Direkt Uçuşlar
            </label>
          </div>

          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? 'Aranıyor...' : 'Uçuş Ara'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {flights.length > 0 && (
          <div className="flights-results">
            <h2>Bulunan Uçuşlar ({flights.length})</h2>
            <div className="flights-grid">
              {flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onBuy={() => handleBuyTicket(flight)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchFlights;
