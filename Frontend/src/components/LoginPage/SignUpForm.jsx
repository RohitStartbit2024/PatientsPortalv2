import { useState } from "react";
import { motion } from "framer-motion";
import { registerPatient } from "../../api/login";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "firstName" || name === "lastName") {
        if (!value) newErrors[name] = "This field is required";
        else if (!nameRegex.test(value))
          newErrors[name] = "Only alphabets are allowed";
        else delete newErrors[name];
      }

      if (name === "phone") {
        if (!value) newErrors.phone = "Phone number is required";
        else if (!phoneRegex.test(value))
          newErrors.phone = "Phone number must be 10 digits";
        else delete newErrors.phone;
      }

      if (name === "email") {
        if (!value) newErrors.email = "Email is required";
        else if (!emailRegex.test(value)) newErrors.email = "Invalid email address";
        else delete newErrors.email;
      }

      if (name === "password") {
        if (!value) newErrors.password = "Password is required";
        else if (!passwordRegex.test(value))
          newErrors.password =
            "Password must be at least 6 characters, include 1 capital letter and 1 number";
        else delete newErrors.password;

        if (updated.confirmPassword && updated.password !== updated.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        else if (updated.confirmPassword) delete newErrors.confirmPassword;
      }

      if (name === "confirmPassword") {
        if (!value) newErrors.confirmPassword = "Confirm password is required";
        else if (updated.password !== updated.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        else delete newErrors.confirmPassword;
      }

      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setMessage("❌ Please fix the errors before submitting");
      return;
    }

    try {
      await registerPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        email: form.email,
        password: form.password,
      });
      setMessage("✅ Registration successful. Please sign in.");
      navigate("/");
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
    Object.keys(errors).length > 0;

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
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          {["firstName", "lastName"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600">
                {field === "firstName" ? "First Name" : "Last Name"}
              </label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                type="text"
                className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
                  errors[field]
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : "focus:ring-purple-300 focus:border-purple-400"
                }`}
                required
              />
              {errors[field] && <p className="text-xs text-red-600">{errors[field]}</p>}
            </div>
          ))}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Phone No.</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            type="tel"
            className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
              errors.phone
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "focus:ring-purple-300 focus:border-purple-400"
            }`}
            required
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
              errors.email
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "focus:ring-purple-300 focus:border-purple-400"
            }`}
            required
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
              errors.password
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "focus:ring-purple-300 focus:border-purple-400"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type={showConfirmPassword ? "text" : "password"}
            className={`mt-1 block w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 transition ${
              errors.confirmPassword
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "focus:ring-purple-300 focus:border-purple-400"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-gray-500"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
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
