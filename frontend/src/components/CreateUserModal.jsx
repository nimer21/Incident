import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from './../api/axiosInstance';

const CreateUserModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/users/create-user", formData, {
        withCredentials: true,
      });
      toast.success(formData.role + " " + response?.data);
      console.log(response);
      setFormData({ username: "", email: "", password: "", role: "" });
      onClose(); // Close modal after submission
    } catch (error) {
      console.error("Error creating user:", error);
      //alert("Failed to create user "+error.response?.data);
      toast.error(error.response?.data.message || error.message);
    }
  };

  if (!isOpen) return null; // Hide modal if not open

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-lg font-semibold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="border rounded w-full p-2"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="border rounded w-full p-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Role</label>
            <select
              className="border rounded w-full p-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="asset_safeguarding">Asset Safeguarding</option>
              <option value="child_safeguarding">Child Safeguarding</option>
              <option value="youth_adult">Youth Adult</option>
              <option value="data_breach">Data Breach</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
