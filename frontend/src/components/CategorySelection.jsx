import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBack, MdCategory } from "react-icons/md";

const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Asset Safeguarding",
    "Child Safeguarding",
    "Youth Adult",
    "Data Breach",
  ];

  const handleCategorySelect = () => {
    if (!selectedCategory) {
      toast.warning("Please select a category before proceeding.");
      return;
    }
    navigate("/incident-form", { state: { category: selectedCategory } });
  };

  const clearSelection = () => {
    setSelectedCategory(""); // Reset the state
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <MdArrowBack className="text-2xl mr-1" />
          <span className="font-semibold">Back to Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <MdCategory className="mr-2 text-3xl text-blue-600" />
          Choose Incident Category
        </h2>

        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                selectedCategory === category ? "bg-blue-50" : ""
              }`}
            >
              <input
                type="radio"
                id={`category-${index}`}
                name="category"
                value={category}
                checked={selectedCategory === category} // Reflect state
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor={`category-${index}`}
                className="ml-3 text-gray-700 cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleCategorySelect}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Continue
          </button>
          <button
            onClick={clearSelection} // Clear selection on click
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
