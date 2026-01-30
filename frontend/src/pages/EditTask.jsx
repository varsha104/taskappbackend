import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { api } from '../utils/api';

export default function EditTask() {
  const { taskId } = useParams();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadTaskData();
  }, [user, navigate, taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      const data = await api.getTask(taskId);

      if (!data.success) {
        navigate('/admin');
        return;
      }

      setTitle(data.task.title);
      setPriority(data.task.priority);
      setDeadline(data.task.deadline);
    } catch (err) {
      setError('Failed to load task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await api.editTask(taskId, title, priority, deadline);

      if (!data.success) {
        setError(data.message || 'Failed to update task');
        return;
      }

      setMessage('Task updated successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setError('Failed to update task: ' + err.message);
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;

  return (
    <div className="bg">
      <div className="center-box">
        <h2>Edit Task</h2>

        <form onSubmit={handleSubmit}>
          <label>Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit">Save Changes</button>
          <br />
          <br />
          <button 
            type="button" 
            onClick={() => navigate('/admin')}
            style={{ background: '#999' }}
          >
            Back to Admin Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
