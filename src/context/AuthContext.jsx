import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);

      if (data.user) {
        setUser(data.user);
        return { ok: true, rol: data.user.rol };
      }

      setError(data.error || data.detail || 'Usuario o contraseña incorrectos.');
      return { ok: false };
    } catch (err) {
      setError(err?.message || 'Error al conectar con el servidor.');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);