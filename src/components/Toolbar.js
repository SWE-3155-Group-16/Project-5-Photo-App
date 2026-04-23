import { useState, useEffect } from 'react';

const Toolbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/admin/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    fetch('/admin/logout', { method: 'POST' })
      .then(() => {
        setUser(null);
        window.location.href = '/login';
      })
      .catch(console.error);
  };

  return (
    <div>
      {user ? (
        <>
          <span>Hello, {user.name}!</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={() => window.location.href = '/login'}>Login</button>
      )}
    </div>
  );
};

export default Toolbar;
