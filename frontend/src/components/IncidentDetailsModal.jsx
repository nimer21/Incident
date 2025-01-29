import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useReactToPrint } from "react-to-print";

const IncidentDetailsModal = ({ selectedIncident, setSelectedIncident, onClose }) => {
    const [newComment, setNewComment] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [attachments, setAttachments] = useState(Array.isArray(selectedIncident?.fileAttachment) ? selectedIncident.fileAttachment : []);

    const componentRef = useRef();

    const [previewImage, setPreviewImage] = useState(null);

    const handlePreview = (filePath) => {
      const fullPath = `${import.meta.env.VITE_API_URL}/backend/${filePath}`;
      setPreviewImage(fullPath);
    };
  
    const closePreview = () => {
      setPreviewImage(null);
    };
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
      
        try {
        // Send POST request to add a comment
        const response = await axiosInstance.post(`/api/incidents/${selectedIncident._id}/comments`,
            { text: newComment }, // Replace 'Admin' with actual username/ID , author: "Admin"
            { withCredentials: true, // Include cookies in requests
          });          
      
          // Check if response indicates success
          if (response.data.ok) {
            const updatedIncident = response.data.updatedIncident;
            setSelectedIncident(updatedIncident); // Update the selected incident in state
            setNewComment(""); // Clear input field
          } else {
            alert("Failed to add comment");
          }
        } catch (error) {
          console.error("Error adding comment:", error);
          toast.error(error.response?.data?.message || "Failed to add comment.");
        }
      };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        setIsUploading(true);
        setUploadProgress(0);
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("incidentId", selectedIncident._id);
    
        try {
            const response = await axiosInstance.post("/api/incidents/upload", formData, {
            withCredentials: true, // Include cookies in requests
            timeout: 50000, // Set timeout to 10 seconds
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          });
          // Append the new file to the attachments list
          setAttachments((prevAttachments) => [...prevAttachments, response.data.filePath]);
          //alert("File uploaded successfully!");
          toast.success(response.data.message);
          // Reload the incident details to reflect the new attachment
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to upload file.");
          console.error("Error uploading file:", error.response?.data || error.message);
        } finally {
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000); // Keep progress visible for 1 second
        }9
      };
  // Print incident details as PDF
  //   const handlePrint = () => {
  //   window.print();
  // };
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Directly pass the ref here
    documentTitle: `Incident-${selectedIncident.caseReference}`,
    onBeforeGetContent: () => {
      console.log("Preparing document for printing...");
    },
    onAfterPrint: () => {
      console.log("Document printed successfully!");
    },
  });  


  //Step 4: Sync State with Backend on Refresh
  //If the page is refreshed, reload the attachments from selectedIncident.fileAttachment: This ensures the state is consistent even after a page reload.
  useEffect(() => {
    if (Array.isArray(selectedIncident?.fileAttachment)) {
      setAttachments(selectedIncident.fileAttachment);
    } else if (selectedIncident?.fileAttachment) {
      setAttachments([selectedIncident.fileAttachment]); // Wrap single file in array
    } else {
      setAttachments([]);
    }
  }, [selectedIncident]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 relative">
      {/* Modal Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="text-xl font-semibold">Incident Details</h2>
        <button
          onClick={onClose}
          className="text-xl font-bold hover:text-gray-300"
        >
          ×
        </button>
      </div>
  
      {/* Modal Body */}
      <div ref={componentRef} className="max-h-[75vh] overflow-y-auto pr-2 p-4 space-y-6">
        {/* Incident Details Section */}
        <div className="border rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Incident Information</h3>
          <p>
            <span className="font-medium">Reference:</span> {selectedIncident.caseReference}
          </p>
          <p>
            <span className="font-medium">Subject:</span> {selectedIncident.subject}
          </p>
          <p>
            <span className="font-medium">Category:</span> {selectedIncident.category}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(selectedIncident.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Severity:</span>{" "}
            <span
              className={`px-2 py-1 rounded ${
                selectedIncident.severity === "High"
                  ? "bg-red-500 text-white"
                  : selectedIncident.severity === "Medium"
                  ? "bg-yellow-500 text-black"
                  : "bg-green-500 text-white"
              }`}
            >
              {selectedIncident.severity}
            </span>
          </p>
        </div>

        <div>
      <hr />
      <h3 className="text-lg font-bold mb-2">Questions and Answers</h3>
      <p>
        <strong>
          Can you please tell us the name of the alleged victim?
        </strong>
      </p>
      <p>{selectedIncident.victimName || "Not provided"}</p>
      <hr />
      <p>
        <strong>
          Can you please share any other useful information about the
          alleged victim (e.g. gender or age)?
        </strong>
      </p>
      <p>{selectedIncident.victimInfo || "Not provided"}</p>
      <hr />
      <p>
        <strong>Where did the incident occur?</strong>
      </p>
      <p>{selectedIncident.location || "Not provided"}</p>
      <hr />
      <p>
        <strong>Please select the programme location:</strong>
      </p>
      <p>{selectedIncident.programLocation || "Not provided"}</p>
      <hr />
      <p>
        <strong>Please select the programme type, if you know:</strong>
      </p>
      <p>{selectedIncident.programType || "Not provided"}</p>
      <hr />
      <p>
        <strong>What is your relationship with our organisation?</strong>
      </p>
      <p>{selectedIncident.relationship || "Not provided"}</p>
      <hr />
      <p>
        <strong>How did you learn about the incident?</strong>
      </p>
      <p>{selectedIncident.knowledgeSource || "Not provided"}</p>
      <hr />
      <p>
        <strong>
          Have you already informed anyone about the incident?
        </strong>
      </p>
      <p>{selectedIncident.informedOthers || "Not provided"}</p>
      <hr />
      <p>
        <strong>Is the incident still ongoing?</strong>
      </p>
      <p>{selectedIncident.ongoingIncident || "Not provided"}</p>
      <hr />
      {/* Add other Q&A fields here */}
        </div>
  
        {/* File Attachments Section */}
        <div className="border rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Attachments</h3>
          {Array.isArray(attachments) && attachments.length > 0 ? (
          <ul className="list-disc ml-5">
            {attachments.map((file, index) => (
              <li key={index}>
                <a
                  href={`${import.meta.env.VITE_API_URL}/backend/${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                  onClick={(e) => {
                    console.log("Opening file:", e.target.href);
                    handlePreview(file);
                  }}
                >
                  {file.split(/[/\\]/).pop()}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No attachments available.</p>
        )}
        {/* Preview Section */}
        {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 relative">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-screen rounded"
            />
          </div>
        </div>
      )}
  
          {/* Upload Section */}
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Attachment
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full h-2.5"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Comments Section */}
        <div className="border rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <ul className="list-disc ml-5 space-y-1">
            {selectedIncident.comments.map((comment, index) => (
              <li key={index}>
                <p>
                  <strong className="font-medium">{comment.author}</strong>:{" "}
                  {comment.text}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border rounded p-2 text-sm mt-2"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2 hover:bg-blue-600"
          >
            Add Comment
          </button>
        </div>
      </div>
  
      {/* Modal Footer */}
      <div className="bg-gray-100 px-4 py-3 flex justify-end space-x-2 rounded-b-lg">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
        <button
        onClick={handlePrint}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Print as PDF
      </button>
      </div>
    </div>
  </div>
  
  );
};

export default IncidentDetailsModal;
