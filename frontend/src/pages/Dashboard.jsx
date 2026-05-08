import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [message, setMessage] = useState('');

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  const isAdmin = storedUser?.role === 'admin';

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) {
      return;
    }

    try {
      const response = await API.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description } = formData;

    if (!title || !description) {
      setMessage('Title and description are required.');
      return;
    }

    try {
      if (editingTaskId) {
        await API.put(`/tasks/${editingTaskId}`, formData);
        setMessage('Task updated successfully.');
      } else {
        await API.post('/tasks', formData);
        setMessage('Task added successfully.');
      }

      setFormData({
        title: '',
        description: '',
        status: 'pending'
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save task.');
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status || 'pending'
    });
    setMessage('Editing task. Remember to save changes.');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending'
    });
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task permanently?')) {
      return;
    }

    try {
      await API.delete(`/tasks/${id}`);
      setMessage('Task deleted successfully.');
      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete task.');
    }
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
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to remove user.');
    }
  };

  return (
    <div>
      <Navbar />

      <div className='dashboard'>
        <form className='task-form' onSubmit={handleSubmit}>
          <h2>{editingTaskId ? 'Update Task' : 'Create Task'}</h2>

          {message && <div className='form-message'>{message}</div>}

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

          <div className='task-form-actions'>
            <button type='submit'>
              {editingTaskId ? 'Save Changes' : 'Add Task'}
            </button>
            {editingTaskId && (
              <button
                type='button'
                className='cancel-button'
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className='tasks-container'>
          {isAdmin && (
            <div className='admin-panel'>
              <h2>Admin Panel</h2>
              <div className='admin-summary'>
                <div className='admin-card'>
                  <span>Users</span>
                  <strong>{users.length}</strong>
                </div>
                <div className='admin-card'>
                  <span>Tasks</span>
                  <strong>{tasks.length}</strong>
                </div>
              </div>

              <div className='user-list'>
                {users.map((user) => (
                  <div key={user._id} className='user-card'>
                    <div>
                      <p className='user-name'>{user.name}</p>
                      <p className='user-email'>{user.email}</p>
                      <p className='user-role'>{user.role.toUpperCase()}</p>
                      <p className='user-task-count'>Tasks: {user.taskCount}</p>
                    </div>
                    <button onClick={() => handleUserDelete(user._id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className='task-card'>
              <h3>No tasks found</h3>
              <p className='task-owner'>Create a task to get started or refresh the page.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className='task-card'>
                <div className='task-card-header'>
                  <h3>{task.title}</h3>
                  <span className={`task-status ${task.status}`}>
                    {task.status}
                  </span>
                </div>

                <p>{task.description}</p>

                {isAdmin && task.createdBy && (
                  <p className='task-owner'>
                    Owner: {task.createdBy.name || task.createdBy.email}
                  </p>
                )}

                <div className='task-actions'>
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button className='danger' onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
