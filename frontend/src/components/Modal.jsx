// src/components/Modal.jsx

import React from 'react';

const Modal = ({ isOpen, onClose, caseReference }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-bold mb-4">Success!</h2>
                <p>Incident reported successfully!</p>
                <p>Your case reference is: <strong>{caseReference}</strong></p>
                <p>Please keep this for your case reference.</p>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;