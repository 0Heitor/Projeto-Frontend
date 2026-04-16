import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('usuario_logado');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isLogged, setIsLogged] = useState(() => {
        return localStorage.getItem('usuario_logado') !== null;
    });

    // Persistência: Verifica se já havia um usuário salvo ao carregar a página
    useEffect(() => {
        const savedUser = localStorage.getItem('usuario_logado');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLogged(true);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsLogged(true);
        localStorage.setItem('usuario_logado', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsLogged(false);
        localStorage.removeItem('usuario_logado');
    };

    return (
        <AuthContext.Provider value={{ user, isLogged, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para facilitar o uso nos componentes
export const useAuth = () => useContext(AuthContext);