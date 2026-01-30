const API_BASE_URL = 'https://taskappbackend-b9s2.onrender.com';
// const API_BASE_URL = 'http://127.0.0.1:5000';

// Helper function to get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth routes
  login: async (email, password, role) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  register: async (fname, lname, contact, email, password, confirmPassword, role) => {
    const formData = new FormData();
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('contact', contact);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    formData.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  forgot: async (email, password, confirmPassword) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    
    const response = await fetch(`${API_BASE_URL}/forgot`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'GET',
    });
    return response.json();
  },

  // Admin routes
  getAdminDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  assignTask: async (userIds, title, priority, deadline) => {
    const formData = new FormData();
    userIds.forEach(uid => formData.append('user_ids', uid));
    formData.append('title', title);
    formData.append('priority', priority);
    formData.append('deadline', deadline);
    
    const response = await fetch(`${API_BASE_URL}/admin`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/edit_task/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  editTask: async (taskId, title, priority, deadline) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('priority', priority);
    formData.append('deadline', deadline);
    
    const response = await fetch(`${API_BASE_URL}/edit_task/${taskId}`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader(),
    });
    return response.json();
  },

  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/delete_task/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  // User routes
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  markTaskDone: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/done/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },
};
  // Auth routes
  login: async (email, password, role) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return response.json();
  },

  register: async (fname, lname, contact, email, password, confirmPassword, role) => {
    const formData = new FormData();
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('contact', contact);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    formData.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return response.json();
  },

  forgot: async (email, password, confirmPassword) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    
    const response = await fetch(`${API_BASE_URL}/forgot`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Admin routes
  getAdminDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin`, {
      credentials: 'include',
    });
    return response.json();
  },

  assignTask: async (userIds, title, priority, deadline) => {
    const formData = new FormData();
    userIds.forEach(uid => formData.append('user_ids', uid));
    formData.append('title', title);
    formData.append('priority', priority);
    formData.append('deadline', deadline);
    
    const response = await fetch(`${API_BASE_URL}/admin`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return response.json();
  },

  getTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/edit_task/${taskId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  editTask: async (taskId, title, priority, deadline) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('priority', priority);
    formData.append('deadline', deadline);
    
    const response = await fetch(`${API_BASE_URL}/edit_task/${taskId}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return response.json();
  },

  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/delete_task/${taskId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  // User routes
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      credentials: 'include',
    });
    return response.json();
  },

  markTaskDone: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/done/${taskId}`, {
      credentials: 'include',
    });
    return response.json();
  },
};
