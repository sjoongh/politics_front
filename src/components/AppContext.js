import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        favorites,
        setFavorites,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
