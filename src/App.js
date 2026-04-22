// ...existing code...
import { useState, useEffect } from 'react';
import LoginRegister from './components/LoginRegister';
// ...existing code...

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth on load
    fetch('/admin/me')
      .then(res => res.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  return (
    // ...existing code...
  );
};
// ...existing code...

