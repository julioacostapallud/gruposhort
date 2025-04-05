'use client';

import { useState, useEffect } from 'react';

const USER = 'admin';
const PASS = '1234';

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('isAuth');
    if (auth === 'true') setIsAuth(true);
  }, []);

  const handleLogin = () => {
    if (userInput === USER && passInput === PASS) {
      sessionStorage.setItem('isAuth', 'true');
      setIsAuth(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  if (!isAuth) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl mb-4">Acceso de Administrador</h1>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Usuario"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Contraseña"
          value={passInput}
          onChange={(e) => setPassInput(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Editor de Propiedades</h1>
      {/* Aquí irá el editor JSON */}
    </div>
  );
}
