import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className='navbar'>
      <div>
        <h2>Task Manager</h2>
        {currentUser && (
          <p className='navbar-subtitle'>
            {currentUser.name} • {currentUser.role.toUpperCase()}
          </p>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;