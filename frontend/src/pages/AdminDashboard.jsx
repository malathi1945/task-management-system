import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    title: '',
    description: '',
    status: 'pending'
  });
  const [message, setMessage] = useState('');
  const usersToShow = users.filter((user) => user.role !== 'admin');

  const fetchUsers = async () => {
    try {
      const response = await API.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    const userTasks = tasks.filter(task => task.createdBy._id === user._id);
    setUserTasks(userTasks);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage('');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setMessage('All fields are required.');
      return;
    }

    try {
      if (editingUser) {
        await API.put(`/auth/users/${editingUser._id}`, { name, email, password });
        setMessage('User updated successfully.');
      } else {
        await API.post('/auth/register', { name, email, password });
        setMessage('User added successfully.');
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        title: '',
        description: '',
        status: 'pending'
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save user.');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    const { title, description, status } = formData;

    if (!title || !description) {
      setMessage('Title and description are required.');
      return;
    }

    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, { title, description, status });
        setMessage('Task updated successfully.');
      } else {
        await API.post('/tasks', { title, description, status, createdBy: selectedUser._id });
        setMessage('Task added successfully.');
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        title: '',
        description: '',
        status: 'pending'
      });
      setEditingTask(null);
      fetchTasks();
      if (selectedUser) {
        handleUserSelect(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save task.');
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      title: '',
      description: '',
      status: 'pending'
    });
    setMessage('Editing user. Remember to save changes.');
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: '',
      email: '',
      password: '',
      title: task.title,
      description: task.description,
      status: task.status || 'pending'
    });
    setMessage('Editing task. Remember to save changes.');
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Remove this user and all their tasks?')) {
      return;
    }

    try {
      await API.delete(`/auth/users/${id}`);
      setMessage('User removed successfully.');
      fetchUsers();
      fetchTasks();
      setSelectedUser(null);
      setUserTasks([]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to remove user.');
    }
  };

  const handleTaskDelete = async (id) => {
    if (!window.confirm('Delete this task permanently?')) {
      return;
    }

    try {
      await API.delete(`/tasks/${id}`);
      setMessage('Task deleted successfully.');
      fetchTasks();
      if (selectedUser) {
        handleUserSelect(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete task.');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditingTask(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      title: '',
      description: '',
      status: 'pending'
    });
    setMessage('');
  };

  return (
    <div>
      <Navbar />

      <div className='admin-dashboard'>
        <div className='admin-sidebar'>
          <h2>Users</h2>
          <div className='user-list'>
            {usersToShow.length === 0 ? (
              <div className='empty-state'>
                No users available yet.
              </div>
            ) : (
              usersToShow.map((user) => (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div>
                    <p className='user-name'>{user.name}</p>
                    <p className='user-email'>{user.email}</p>
                    <p className='user-role'>{user.role.toUpperCase()}</p>
                    <p className='user-task-count'>Tasks: {user.taskCount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='admin-main'>
          {message && <div className='form-message'>{message}</div>}

          <div className='admin-forms'>
            <form className='admin-form' onSubmit={handleUserSubmit}>
              <h3>{editingUser ? 'Update User' : 'Add User'}</h3>

              <input
                type='text'
                name='name'
                placeholder='Name'
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type='email'
                name='email'
                placeholder='Email'
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type='password'
                name='password'
                placeholder='Password'
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
              />

              <div className='form-actions'>
                <button type='submit'>
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                {(editingUser || editingTask) && (
                  <button
                    type='button'
                    className='cancel-button'
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {selectedUser && (
              <form className='admin-form' onSubmit={handleTaskSubmit}>
                <h3>{editingTask ? 'Update Task' : 'Add Task for ' + selectedUser.name}</h3>

                <input
                  type='text'
                  name='title'
                  placeholder='Task Title'
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name='description'
                  placeholder='Task Description'
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

                <select
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value='pending'>Pending</option>
                  <option value='completed'>Completed</option>
                </select>

                <div className='form-actions'>
                  <button type='submit'>
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {selectedUser && (
            <div className='user-tasks'>
              <h3>Tasks for {selectedUser.name}</h3>
              <div className='tasks-grid'>
                {userTasks.length === 0 ? (
                  <div className='task-card'>
                    <h4>No tasks found</h4>
                    <p>Create a task for this user.</p>
                  </div>
                ) : (
                  userTasks.map((task) => (
                    <div key={task._id} className='task-card'>
                      <div className='task-card-header'>
                        <h4>{task.title}</h4>
                        <span className={`task-status ${task.status}`}>
                          {task.status}
                        </span>
                      </div>

                      <p>{task.description}</p>

                      <div className='task-actions'>
                        <button onClick={() => handleTaskEdit(task)}>Edit</button>
                        <button className='danger' onClick={() => handleTaskDelete(task._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className='user-actions'>
              <button className='danger' onClick={() => handleUserDelete(selectedUser._id)}>
                Remove User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;