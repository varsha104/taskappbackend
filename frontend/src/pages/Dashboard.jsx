import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { api } from '../utils/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();

      if (!data.success) {
        navigate('/');
        return;
      }

      setUserName(data.user_name);
      setTasks(data.tasks || []);
    } catch (err) {
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (taskId) => {
    try {
      const data = await api.markTaskDone(taskId);
      if (data.success) {
        loadDashboard();
      } else {
        setError(data.message || 'Failed to mark task done');
      }
    } catch (err) {
      setError('Failed to mark task done: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const data = await api.logout();
      if (data.success) {
        logout();
        navigate('/');
      }
    } catch (err) {
      setError('Logout failed: ' + err.message);
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;

  return (
    <>
      <div className="top-bar">
        <h2>Welcome, {userName || user?.name}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="page-content">
        {error && <p className="error">{error}</p>}

        <div className="card">
          <h3>Your Assigned Tasks</h3>
          {tasks.length === 0 ? (
            <p>No tasks assigned yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Completed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>{task.deadline}</td>
                    <td>{task.completedAt || '-'}</td>
                    <td>
                      {task.status === 'Done' ? (
                        <button disabled style={{ background: 'gray', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '5px' }}>
                          Done
                        </button>
                      ) : (
                        <button 
                          style={{ background: 'green', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                          onClick={() => handleMarkDone(task.id)}
                        >
                          Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Task Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Total</th>
                <th>Completed</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{tasks.length}</td>
                <td>{tasks.filter(t => t.status === 'Done').length}</td>
                <td>{tasks.filter(t => t.status === 'Pending').length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
