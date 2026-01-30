import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { api } from '../utils/api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadAdminDashboard();
  }, [user, navigate]);

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDashboard();

      if (!data.success) {
        navigate('/');
        return;
      }

      setUsers(data.users || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError('Failed to load admin dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (selectedUserIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      const data = await api.assignTask(selectedUserIds, title, priority, deadline);
      
      if (!data.success) {
        setError(data.message || 'Failed to assign task');
        return;
      }

      setMessage('Task assigned successfully!');
      setSelectedUserIds([]);
      setTitle('');
      setPriority('High');
      setDeadline('');
      loadAdminDashboard();
    } catch (err) {
      setError('Failed to assign task: ' + err.message);
    }
  };

  const handleEditTask = (taskId) => {
    navigate(`/edit_task/${taskId}`);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const data = await api.deleteTask(taskId);
      if (data.success) {
        setMessage('Task deleted successfully!');
        loadAdminDashboard();
      } else {
        setError(data.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task: ' + err.message);
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
        <h2>Admin Dashboard – Assign / Manage Tasks</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="page-content">
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        {/* ASSIGN TASK */}
        <div className="card">
          <h3>Assign Task to Users</h3>

          <form onSubmit={handleAssignTask}>
            <h4>Select Users</h4>
            {users.length === 0 ? (
              <p>No users available.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </td>
                      <td>
                        {user.name} ({user.email})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />

            <button className="assign-btn" type="submit">
              Assign Task
            </button>
          </form>
        </div>

        {/* ALL TASKS */}
        <div className="card">
          <h3>All Assigned Tasks</h3>

          {tasks.length === 0 ? (
            <p>No tasks assigned yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.userEmail}</td>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>{task.deadline}</td>
                    <td>{task.completedAt || '-'}</td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-update"
                          onClick={() => handleEditTask(task.id)}
                        >
                          Update
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
