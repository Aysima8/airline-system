import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e3c72' }}>✈️ Giriş Yap</h1>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Kullanıcı adınızı girin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Şifrenizi girin"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#555' }}>
          Hesabınız yok mu? <Link to="/register" style={{ color: '#1e3c72', fontWeight: '600' }}>Kayıt Ol</Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(30, 60, 114, 0.1)', borderRadius: '8px', border: '1px solid rgba(30, 60, 114, 0.2)' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e3c72' }}><strong>Test Kullanıcıları:</strong></p>
          <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', color: '#444' }}>Admin: <code style={{ background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px' }}>admin</code> / <code style={{ background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px' }}>admin123</code></p>
          <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', color: '#444' }}>User: <code style={{ background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px' }}>user</code> / <code style={{ background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px' }}>user123</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
