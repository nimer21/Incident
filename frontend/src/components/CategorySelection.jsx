import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CategorySelection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        'Asset Safeguarding',
        'Child Safeguarding',
        'Youth & Adult',
        'Data Breach',
        //"Violation of children's privacy",
        //'Financial abuse',
        //'Bullying',
    ];

    const handleCategorySelect = () => {
        if (!selectedCategory) {
            alert('Please select a category before proceeding.');
            return;
        }
        // Navigate to the next page, passing the selected category as state
        navigate('/incident-form', { state: { category: selectedCategory } }, { replace: true });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Choose Incident Category
            </h2>

            <div className="space-y-4">
                {categories.map((category, index) => (
                    <div key={index} className="flex items-center">
                        <input
                            type="radio"
                            id={`category-${index}`}
                            name="category"
                            value={category}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor={`category-${index}`} className="ml-3 text-gray-700">
                            {category}
                        </label>
                    </div>
                ))}
            </div>

            <button
                onClick={handleCategorySelect}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none"
            >
                Continue
            </button>
        </div>
    );
};

export default CategorySelection;
