// ...existing code...
import { useState, useEffect } from 'react';
// ...existing code...

const Toolbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info from session (assume a /admin/me endpoint)
    fetch('/admin/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    fetch('/admin/logout', { method: 'POST' })
      .then(() => setUser(null))
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
      // ...existing code...
    </div>
  );
};
// ...existing code...

