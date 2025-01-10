import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdLock, MdPerson } from "react-icons/md";
import useAuthContext from "../context/AuthContext";

const LoginPage = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const { login, errors } = useAuthContext();
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    login(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* Header with Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <MdArrowBack className="text-2xl mr-1" />
          <span className="font-semibold">Back to Home</span>
        </button>
      </div>

      {/* Login Section */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center justify-center">
          <MdLock className="mr-2 text-3xl" />
          Login
        </h2>
        {errors && <p className="text-red-500 mb-4 text-center">{errors}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="username"
                id="username"
                value={data.username}
                onChange={handleOnChange}
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                id="password"
                value={data.password}
                onChange={handleOnChange}
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
