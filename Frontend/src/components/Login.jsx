import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [isloading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: " " }); // Clear error when user types
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

  const validate = () => {
    let newErrors = {};

    if (!input.email.trim()) newErrors.email = "Email is required";
    if (!input.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/v1/user/login",
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
          navigate("/"); // Navigate after delay
        }, 1500);
        setInput({ email: "", password: "" }); // Reset input fields
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <form
        onSubmit={loginHandler}
        className="bg-white shadow-2xl rounded-lg flex flex-col gap-5 p-8 w-96"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">LOGO</h1>
          <p className="text-gray-600 text-sm mt-2">
            Login to see photos and videos from your friends
          </p>
        </div>

        <div className="flex flex-col gap-3 text-left">
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

        <div className="flex flex-col gap-3 text-left">
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

        {isloading ? (
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white  rounded-md">
            Please wait...{" "}
            <Loader2 className="text-center w-6 h-6 animate-spin" />
            
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.email.trim() || !input.password.trim()}
            className={`font-medium py-2 rounded-md transition 
              ${
                !input.email.trim() || !input.password.trim()
                  ? "bg-gray-400 cursor-not-allowed" // Gray out and show 🚫
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
          >
            Login
          </button>
        )}

        <span className="text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
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

export default Login;
