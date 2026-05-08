import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: ''
  });
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, adminCode } = formData;

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        adminCode
      });

      alert(response.data.message);
      setError('');
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={handleSubmit}>
        <div className='form-header'>
          <span>Join the team</span>
        </div>

        <h1>Register</h1>

        {error && <div className='form-error'>{error}</div>}

        <input
          type='text'
          name='name'
          placeholder='Enter Name'
          value={formData.name}
          onChange={handleChange}
          required
        />

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

        <input
          type='text'
          name='adminCode'
          placeholder='Admin code (optional)'
          value={formData.adminCode}
          onChange={handleChange}
        />

        <button type='submit'>Register</button>

        <p>
          Already have account?
          <Link to='/'> Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;