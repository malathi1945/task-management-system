import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const toggleAdminMode = () => {
    setError('');
    setFormData({ email: '', password: '' });
    setIsAdminMode((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      const response = await API.post('/auth/login', { email, password });

      if (isAdminMode && response.data.user.role !== 'admin') {
        setError('Admin login requires admin credentials.');
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError('');

      if (isAdminMode || response.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className='login-page'>
      <button className='page-admin-toggle' onClick={toggleAdminMode}>
        {isAdminMode ? '← User Login' : 'Admin Login'}
      </button>

      <div className='container'>
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-header'>
            <span>{isAdminMode ? 'Admin sign in' : 'Sign in to your account'}</span>
          </div>

          <h1>{isAdminMode ? 'Admin Login' : 'Login'}</h1>

          {error && <div className='form-error'>{error}</div>}

          <input
            type='email'
            name='email'
            placeholder='Enter Email'
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type='password'
            name='password'
            placeholder='Enter Password'
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type='submit'>{isAdminMode ? 'Admin Login' : 'Login'}</button>

          {!isAdminMode && (
            <>
              <p className='form-note'>
                Sign in with your registered email and password. Admin accounts are routed to the Admin Dashboard.
              </p>

              <p>
                Don't have an account?
                <Link to='/register'> Register</Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;