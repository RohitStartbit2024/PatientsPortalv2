import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyToken } from "../../api/login";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const checkAuth = async () => {
      if (!user || !token) {
        handleLogout();
        return;
      }

      const isValid = await verifyToken(token);
      if (!isValid) {
        handleLogout();
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    document.cookie =
      "refreshToken=; path=/; max-age=0; secure; samesite=strict";
    setUser(null); // reset context
    setTimeout(() => navigate("/", { replace: true }), 0);
  };

  if (!user) return null; // Don't show sidebar if not logged in

  // Routes based on role
  const routes =
    user.role === "Admin"
      ? [
          { path: "/admin-dashboard", label: "Admin Dashboard" },
          { path: "/upload-reports", label: "Upload Reports" },
        ]
      : [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/reports", label: "Reports" },
        ];

  return (
    <>
      {/* Toggle button (hide on "/") */}
      {location.pathname !== "/" && (
        <button
          className={`${
            isOpen ? "hidden" : "fixed"
          } top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md`}
          onClick={() => setIsOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)} // close on click outside
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {user.firstName} {user.lastName}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {routes.map((r) => (
            <Link
              key={r.path}
              to={r.path}
              className="block py-2 px-3 rounded-md hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              {r.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="mt-4 bg-red-600 hover:bg-red-700 py-2 px-3 rounded-md text-left"
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
