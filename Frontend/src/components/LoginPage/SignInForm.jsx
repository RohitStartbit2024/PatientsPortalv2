import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { login, setupMfa, verifyMfaSetup, loginMfa } from "../../api/login";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function SignInForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaStep, setMfaStep] = useState(null); // null | setup | verify | login
  const [qrCode, setQrCode] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [message, setMessage] = useState("");
  const { setUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);

      if (!res.mfaSetup) {
        // Ask user to set up MFA
        const mfaRes = await setupMfa(email);
        setQrCode(mfaRes.qrCodeBase64);
        setMfaStep("setup");
        setMessage("Scan QR code and enter OTP to enable MFA");
      } else {
        setMfaStep("login");
        setMessage("Enter your MFA code");
      }
    } catch (err) {
      setMessage(err.message || "Login failed");
    }
  };

  const handleVerifyMfaSetup = async (e) => {
    e.preventDefault();
    try {
      await verifyMfaSetup(email, totpCode);
      setMessage("MFA setup successful. Please log in with your MFA code.");
      setMfaStep(null);
      setTotpCode("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleLoginMfa = async (e) => {
    e.preventDefault();
    try {
      const res = await loginMfa(email, totpCode);

      // ✅ Clear old data first
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // ✅ Save new tokens
      if (res.token) {
        localStorage.setItem("accessToken", res.token);
      }
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
        document.cookie = `refreshToken=${res.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7
          }; secure; samesite=strict`;
      }

      // ✅ Save user details
      if (res.email) {
        const userObj = {
          email: res.email,
          role: res.role,
          firstName: res.firstName,
          lastName: res.lastName,
        };

        localStorage.setItem("user", JSON.stringify(userObj));

        // 🔥 Update React state immediately (if you’re using AuthContext)
        if (typeof setUser === "function") {
          setUser(userObj);
        }
      }

      setMessage("Login successful ✅");

      // ✅ Navigate by role
      if (res.role === "Patient") {
        navigate("/dashboard");
      } else if (res.role === "Admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      setMessage(err.message || "MFA login failed ❌");
    }
  };

  return (
    <>
      <motion.form
        key="signin-form"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
        onSubmit={mfaStep === "setup" ? handleVerifyMfaSetup : mfaStep === "login" ? handleLoginMfa : handleLogin}
      >
        {/* Email & password only on first step */}
        {mfaStep === null && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-8 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </>
        )}

        {/* Show QR Code if MFA setup is required */}
        {mfaStep === "setup" && qrCode && (
          <div>
            <p className="text-sm text-gray-600">Scan this QR code with Google Authenticator:</p>
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="MFA QR"
              className="my-2 mx-auto"
              style={{ width: "180px", height: "180px", objectFit: "contain" }}
            />
          </div>
        )}

        {/* MFA code input (for both setup + login) */}
        {(mfaStep === "setup" || mfaStep === "login") && (
          <div>
            <label className="block text-sm font-medium text-gray-600">MFA Code</label>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
            />
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
        >
          {mfaStep === "setup" ? "Verify MFA Setup" : mfaStep === "login" ? "Login with MFA" : "Sign In"}
        </motion.button>

        {message && <p className="text-sm text-center text-red-500">{message}</p>}
      </motion.form>
    </>
  );
}
