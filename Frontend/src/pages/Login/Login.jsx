import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import SignInForm from '../../components/LoginPage/SignInForm';
import SignUpFrom from '../../components/LoginPage/SignUpForm';
export default function Login(){
    const [isSignIn, setIsSignIn] = useState(true);
    return(
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">
      <div className="w-full max-w-md relative">
        {/* Card */}
        <motion.div
          key={isSignIn ? "signin" : "signup"}
          initial={{ opacity: 0, y: 40, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -40, rotateX: 15 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-white shadow-2xl rounded-2xl p-6"
        >
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide">
            Patients Portal
          </h1>

          {/* Toggle */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-2 text-center font-semibold transition ${
                isSignIn
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-400 hover:text-blue-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-2 text-center font-semibold transition ${
                !isSignIn
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-400 hover:text-blue-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Animate Forms */}
          <AnimatePresence mode="wait">
            {isSignIn ? (
              <SignInForm/>
            ) : (
              <SignUpFrom/>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
    )
}