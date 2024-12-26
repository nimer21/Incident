import { useState } from "react";
import useAuthContext from "../context/AuthContext";

const RegistrationForm = ({incidents}) => {
    const [data, setData] = useState({
        username: "",
        password: "",
        role: "user",
        incidents: [incidents],
      });
      const {register, errors} = useAuthContext();

      const handelOnChange = (e) => {
        const { name, value } = e.target;

        setData((preve)=> {
            return {...preve, [name]: value }
        });
    }

    const handleRegister = async (event) => {
        event.preventDefault();
        register({...data});
    };

    return (
        <form onSubmit={handleRegister} className="p-4 bg-gray-100 rounded-md">
            <div className="mt-6 bg-white shadow-md rounded p-6">
                <h2 className="text-xl font-bold mb-4">Register for Tracking</h2>
                {errors && <p className="text-red-500 mb-4">{errors}</p>}
                <div className="mb-4">
                    <label htmlFor="username" className="block mb-2">Username</label>
                    <input
                        type="text"
                        placeholder="username"
                        id="username"
                        name="username"
                        value={data.username}
                        onChange={handelOnChange}
                        className="border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="password"
                        id="password"
                        name="password"
                        value={data.password}
                        onChange={handelOnChange}
                        className="border rounded w-full py-2 px-3"
                    />
                </div>
                <button
                    // onClick={handleRegister}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                    Register
                </button>
            </div>
            </form>
    );
};
export default RegistrationForm;
