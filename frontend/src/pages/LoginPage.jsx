import React, { useState } from "react";
import useAuthContext from "../context/AuthContext";

const LoginPage = () => {
    const [data, setData] = useState({
        username: "",
        password: "",
      });
      const {login, errors} = useAuthContext();

      const handelOnChange = (e) => {
        const { name, value } = e.target;
        setData((preve) => {
          return { ...preve, [name]: value };
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        login(data);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            {errors && <p className="text-red-500 mb-4">{errors}</p>}
            <form onSubmit={handleLogin} className="w-1/3 bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={data.username}
                        onChange={handelOnChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={data.password}
                        onChange={handelOnChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
