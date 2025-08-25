import { createContext, useEffect, useState } from "react";
import { validateRefresh } from "../api/login";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // {email, role, firstName, lastName}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;
  const refreshToken = localStorage.getItem("refreshToken");

  if (email && refreshToken) {
    validateRefresh(email, refreshToken)
      .then((res) => {

        if (res.valid) {
          setUser({
            email: res.email,
            role: res.role,
            firstName: res.firstName,
            lastName: res.lastName,
          });
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
        }
      })
      .catch((err) => {
        localStorage.removeItem("email");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, []);


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
