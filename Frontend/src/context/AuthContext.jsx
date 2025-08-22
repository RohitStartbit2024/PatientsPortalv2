import { createContext, useEffect, useState } from "react";
import { validateRefresh } from "../api/login";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // {email, role, firstName, lastName}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("AuthContext mounted");  

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;
  const refreshToken = localStorage.getItem("refreshToken");
  console.log("Storage:", { email, refreshToken });

  if (email && refreshToken) {
    validateRefresh(email, refreshToken)
      .then((res) => {
        console.log("validateRefresh response:", res);  // 👈 Check here

        if (res.valid) {
          setUser({
            email: res.email,
            role: res.role,
            firstName: res.firstName,
            lastName: res.lastName,
          });
        } else {
          console.warn("Token invalid, clearing storage");
          localStorage.removeItem("email");
          localStorage.removeItem("refreshToken");
        }
      })
      .catch((err) => {
        console.error("validateRefresh error:", err);
        localStorage.removeItem("email");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => {
        console.log("AuthContext loading finished");
        setLoading(false);
      });
  } else {
    console.log("No token in storage, skipping validate");
    setLoading(false);
  }
}, []);


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
