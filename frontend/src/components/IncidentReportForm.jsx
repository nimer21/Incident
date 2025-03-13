// src/components/IncidentReportForm.jsx

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from './Modal';
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance.jsx";

const IncidentReportForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = location.state || {}; // Get the category from the previous page
  const [caseReference, setCaseReference] = useState("");
  const [caseId, setCaseId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  //const {user} = useAuthContext();
  const user = useSelector((state) => state.user.user);
  //console.error("User :",user);

 
  const [formData, setFormData] = useState({
    category: category,
    subject: "",
    nameProvided: "",
    incidentDescription: "",
    victimName: "",
    victimInfo: "",
    location: "",
    programLocation: "",
    programType: "",
    relationship: "",
    knowledgeSource: "",
    informedOthers: "",
    ongoingIncident: "",
    perpetratorInfo: "",
    fileAttachment: null,
    user: null,
  });

  const countriesWithCities = {
    Palestine: ['SFC Bethlehem', 'SFC Rafah', 'National Office', 'Gaza', 'Westbank'],
    //Egypt: ['Cairo', 'Alexandria', 'Tanta'],
    //USA: ['New York', 'Los Angeles', 'Chicago'],
    // Add more countries and their cities as needed
};

const handleBackClick = (e) => {
  e.preventDefault();
  const confirmLeave = window.confirm(
      "If you continue, all entries on this page will be deleted. Do you want to proceed?"
  );
  if (confirmLeave) {
      navigate(-1); // Navigates to the previous page      
  }
};

const handleCloseClick = () => {
  setIsModalOpen(false);
  // Navigate to the submission success page with the case reference
  navigate("/submission-success", { state: { caseReference, incidents: [caseId] } }); //This ensures incidents is always passed as an array, even if there’s only one value.
  // navigate("/");
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, fileAttachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
      
    const dataToSubmit = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
        if (formData[key]) {
            dataToSubmit.append(key, formData[key]);
        }
    });
  //   if (!user) {
  //     console.error("User ID is missing.");
  //     return;
  // }

    // Append userId directly
    if (user.user) {
        dataToSubmit.append("user", user.user.userId);
    }
    try {
      const response = await axiosInstance.post(
        "/api/incidents/report",
        dataToSubmit,
        {
        headers: {
            "Content-Type": "multipart/form-data",
            //Authorization: `Bearer ${localStorage.getItem("authToken")}` // ✅ Ensure token is included
            ...(localStorage.getItem("authToken") && {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }),
            },
            withCredentials: true, // ✅ Send cookies only if user is logged in
    });

    // Get the response data
    const { caseReference, incedent_id } = response.data;
        setCaseReference(caseReference);
        setCaseId(incedent_id);
        // Open modal after successful submission
        setIsModalOpen(true);

      setFormData({
        subject: "",
        nameProvided: "",
        incidentDescription: "",
        victimName: "",
        victimInfo: "",
        location: "",
        programLocation: "",
        programType: "",
        relationship: "",
        knowledgeSource: "",
        informedOthers: "",
        ongoingIncident: "",
        perpetratorInfo: "",
        fileAttachment: null,
        user: null,
      });
    } catch (error) {
      console.error("Error reporting incident:", error);  
      //setError("Failed to report the incident. Please try again.");
      alert(error.response?.data?.error || "Failed to report the incident.");
      console.error("Error reporting incident:", error.response?.data || error.message);

    }
  };

  useEffect(() => {
    if (!category) {
      // Redirect to the category selection page if accessed directly
      navigate("/categor-selection");
      toast.warning("Please select a category first.");
      //return null;
    }
  }, [navigate, category]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <a href="#">
            <img className="rounded-t-lg" src="./src/assets/main.svg" alt="" />
          </a>
          <div className="p-5">
            <div className="flex justify-evenly items-center mb-4">
              <a href="#">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Report to be sent to:
                </h5>
              </a>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                SOS Children’s Villages International – Child Care and
                Safeguarding Dept.
              </p>
            </div>

            <div className="flex justify-evenly items-center mb-4">
              <a href="#">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white justify-items-start">
                  Category:
                </h5>
              </a>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {category}
              </p>
            </div>

            <Link to="/"  
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Back to Home
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Incident Reporting Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter location"
            />
          </div>

          {/* Name Provided */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Do you want to provide your name?
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nameProvided"
                  value="Yes"
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nameProvided"
                  value="No"
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Conditional First Name and Last Name Fields */}
          {formData.nameProvided === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Your first name"
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {formData.nameProvided === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Your last name"
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {/* Incident Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe the incident
            </label>
            <textarea
              name="incidentDescription"
              placeholder="Provide details about the incident..."
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full h-24"
            ></textarea>
          </div>

          {/* Victim Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name of Alleged Victim
            </label>
            <input
              type="text"
              name="victimName"
              placeholder="Victim's name"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>

          {/* Additional Info about Victim */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Info about Victim (e.g., gender or age)
            </label>
            <input
              type="text"
              name="victimInfo"
              placeholder="Gender/Age"
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>

          {/* Location of Incident */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Where did the incident occur?
            </label>
            <select
              name="location"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">- Please select -</option>
              {/* Add other options as necessary */}
              {/* {countries.map((ele, index) => {
                return (
                  <option key={ele.value + index} value={ele.value}>
                    {ele.name}
                  </option>
                );
              })} */}
                        {Object.keys(countriesWithCities).map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
            </select>
          </div>

          {/* Program Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Program Location
            </label>
            <select
              name="programLocation"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              disabled={!formData.location} // Disable if no country is selected
            >
              <option value="">Please select</option>
              {/* Add other options as necessary */}
              {formData.location && countriesWithCities[formData.location].map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
            </select>
          </div>

          {/* Program Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Program Type
            </label>
            <select
              name="programType"
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Please select</option>
              {/* Add other options as necessary */}
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
            </select>
          </div>

          {/* Relationship with Organization Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Relationship with Our Organization
            </label>
            <select
              name="relationship"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Please select</option>
              {/* Add other options as necessary */}
              <option value="Child / young person supported by SOS Children's Villages">Child / young person supported by SOS Children's Villages</option>
              <option value="Co-worker">Co-worker</option>
              <option value="Parent / Caregiver">Parent / Caregiver</option>
              <option value="Person outside of the organisation e.g. community member, donor">Person outside of the organisation e.g. community member, donor</option>
              <option value="Suppler / business partner / programme partner">Suppler / business partner / programme partner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Knowledge Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              How did you learn about the incident?
            </label>
            <textarea
              name="knowledgeSource"
              placeholder="Describe how you learned about the incident..."
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 w-full h-24 resize-y rounded-md"
            ></textarea>
          </div>

          {/* Informed Others Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you already informed anyone about the incident?
            </label>
            <select
              name="informedOthers"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Please select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Ongoing Incident Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Is the incident still ongoing?
            </label>
            <select
              name="ongoingIncident"
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Please select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="I don't know">I don't know</option>
            </select>
          </div>

          {/* Perpetrator Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Information about Alleged Perpetrator
            </label>
            <textarea
              name="perpetratorInfo"
              placeholder="Provide information about the perpetrator..."
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 w-full h-24 resize-y rounded-md"
            ></textarea>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach a File (optional)
            </label>
            <input type="file" onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
             />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition duration-200 text-white py-2 rounded"
          >
            Submit Report
          </button>

          {/* Back Link */}
          <div className="mt-6">
                    <button
                        onClick={handleBackClick}
                        className="text-red-600 hover:text-red-800 underline"
                    >
                        Back
                    </button>
                </div>
        </form>
        {/* Modal for success message */}
        <Modal 
                isOpen={isModalOpen} 
                onClose={() => handleCloseClick()} 
                caseReference={caseReference} 
            />
      </div>
    </div>
  );
};

export default IncidentReportForm;
