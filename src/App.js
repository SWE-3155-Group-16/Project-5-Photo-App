import { useState, useEffect } from 'react';
import LoginRegister from './components/LoginRegister';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch('/admin/me')
      .then(res => {
        setIsAuthenticated(res.ok);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  return (
    // ...existing code...
  );
};

export default App;
