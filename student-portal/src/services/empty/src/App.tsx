import React, { useState } from 'react';
import Login from '../Login';
import ApiKeyManager from '../ApiKeyManager';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 16 }}>
      {loggedIn ? <ApiKeyManager /> : <Login onLogin={() => setLoggedIn(true)} />}
    </div>
  );
}

export default App;
