import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password, role);

      if (!data.success) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Store JWT token
      localStorage.setItem('token', data.token);

      // Login successful
      login({
        email,
        name: data.user.name,
        role: data.user.role,
      });

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg">
      <div className="center-box">
        <h2>User / Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="user">User Login</option>
            <option value="admin">Admin Login</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <p className="error">{error}</p>}

          <div className="auth-links">
            <Link to="/forgot">Forgot Password?</Link>
            <Link to="/register">New user? Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
