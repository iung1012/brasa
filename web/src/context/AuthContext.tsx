import { createContext, useContext, useState } from "react";

interface User {
  id: string;
  username: string;
  displayName: string;
  profileType: string;
  verification: string;
  avatarUrl?: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, token: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("brasa_token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("brasa_user");
    return raw ? JSON.parse(raw) : null;
  });

  function login(t: string, u: User) {
    localStorage.setItem("brasa_token", t);
    localStorage.setItem("brasa_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("brasa_token");
    localStorage.removeItem("brasa_user");
    setToken(null);
    setUser(null);
  }

  return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
