import { useState } from "react";
import { motion } from "framer-motion";
import { registerPatient } from "../../api/login"; // adjust path if needed
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({ confirmPassword: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          updated.confirmPassword && updated.password !== updated.confirmPassword
            ? "Passwords do not match"
            : ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match"
      }));
      return;
    }
    try {
      const res = await registerPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        email: form.email,
        password: form.password
      });
      setMessage("✅ Registration successful. Please sign in.");
      navigate('/')
    } catch (err) {
      setMessage(`❌ ${err.message || "Registration failed"}`);
    }
  };

  const disableSubmit =
    !form.firstName ||
    !form.lastName ||
    !form.email ||
    !form.phone ||
    !form.password ||
    !form.confirmPassword ||
    !!errors.confirmPassword;

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        key="signup-form"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Phone No.</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            type="tel"
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type="password"
            className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
              errors.confirmPassword
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "focus:ring-purple-300 focus:border-purple-400"
            }`}
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          disabled={disableSubmit}
          className={`w-full text-white py-2 rounded-lg font-medium shadow transition ${
            disableSubmit
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Sign Up
        </motion.button>
      </motion.form>

      {message && <p className="text-center text-sm mt-2 text-gray-700">{message}</p>}
    </>
  );
}
