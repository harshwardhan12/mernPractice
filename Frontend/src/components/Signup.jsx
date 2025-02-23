import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when user types
  };

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault(); // Block spacebar input
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes(" ")) {
      e.preventDefault(); // Block pasted spaces
    }
  };

  const validDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
  ];

  const validate = () => {
    let newErrors = {};

    if (input.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!/\S+@\S+\.\S+/.test(input.email)) {
      newErrors.email = "Enter a valid email address";
    } else {
      const domain = input.email.split("@")[1];
      if (!validDomains.includes(domain)) {
        newErrors.email = "Enter a valid email domain (e.g., gmail.com)";
      }
    }

    if (input.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Stop submission if validation fails

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message); // Show toast
        setTimeout(() => {
          navigate("/login"); // Navigate after delay
        }, 1500);
        setInput({ username: "", email: "", password: "" }); // Reset input fields
      }
    } catch (error) {
      setErrors({ api: error.response?.data?.message || "Signup failed!" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <form
        onSubmit={signupHandler}
        className="bg-white shadow-2xl rounded-lg flex flex-col gap-5 p-8 w-96"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">LOGO</h1>
          <p className="text-gray-600 text-sm mt-2">
            Signup to see photos and videos from your friends
          </p>
        </div>

        {/* Username Field */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={input.username}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Blocks spaces from being typed
            onPaste={handlePaste} // Blocks spaces from being pasted
            placeholder="Enter your username"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-0"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={input.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Blocks spaces from being typed
            onPaste={handlePaste} // Blocks spaces from being pasted
            placeholder="Enter your email"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-0"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={input.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Blocks spaces from being typed
            onPaste={handlePaste} // Blocks spaces from being pasted
            placeholder="Enter your password"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-0"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        {/* API Error Message */}
        {errors.api && <p className="text-red-500 text-center">{errors.api}</p>}

        {/* Signup Button */}
        {isLoading ? (
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md">
            <Loader2 className="text-center w-6 h-6 animate-spin" />
            Please wait...
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.username.trim() || !input.email.trim() || !input.password.trim()}
            className={`font-medium py-2 rounded-md transition 
              ${
                !input.email.trim() || !input.password.trim() || !input.username.trim()
                  ? "bg-gray-400 cursor-not-allowed" // Gray out and show 🚫
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
          >
            Signup
          </button>
        )}

        <span className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </span>
      </form>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </div>
  );
};

export default Signup;
