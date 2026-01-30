import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Register() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.register(
        fname,
        lname,
        contact,
        email,
        password,
        confirmPassword,
        role
      );

      if (!data.success) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful - redirect to login
      navigate('/');
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg">
      <div className="center-box">
        <h2>Registration</h2>

        <form onSubmit={handleSubmit}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="user">User Registration</option>
            <option value="admin">Admin Registration</option>
          </select>

          <input
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="10 digit Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email (gmail / yahoo)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          {error && <p className="error">{error}</p>}

          <Link to="/">Already registered? Login</Link>
        </form>
      </div>
    </div>
  );
}
