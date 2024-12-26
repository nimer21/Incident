<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white w-3/4 max-w-4xl md:w-1/2 p-6 rounded-lg shadow-lg relative">
{/* Modal Header */}
  <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3 rounded-t-lg">
    <h2 className="text-xl font-semibold">Incident Details</h2>
    <button
    onClick={onClose}
    className="text-xl font-bold hover:text-gray-300"
    >×</button>
  </div>
  {/* Modal Body */}
  <div className="max-h-[75vh] overflow-y-auto pr-2">
  {/* <div className="p-4 space-y-6"> */}
      {/* Incident Details Section */}
    <div className="border rounded-lg p-4 shadow-md mt-2">
    <h3 className="text-lg font-semibold mb-2">Incident Information</h3>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(selectedIncident.createdAt).toLocaleDateString()}
      </p>
      <p>
        <strong>Reference:</strong> {selectedIncident.caseReference}
      </p>
      <p>
        <strong>Organisation:</strong> SOS Children’s Villages
        International – Child Care and Safeguarding Dept.
      </p>
      <p>
        <strong>Category:</strong> {selectedIncident.category}
      </p>
      <p>
        <strong>Subject:</strong> {selectedIncident.subject}
      </p>
      <p className="mt-2">
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
  {/* File Attachments Section */}
      <h3 className="mt-2 font-medium">Attachments:</h3>
  {Array.isArray(selectedIncident.fileAttachment) ? (
    <ul className="list-disc ml-5">
      {selectedIncident.fileAttachment.map((file, index) => (
        <li key={index}>
          <a
            href={`/${file}`} // Assuming `file` is a relative path
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {file.split("/").pop()} {/* Display only the file name */}
          </a>
        </li>
      ))}
    </ul>
  ) : selectedIncident.fileAttachment ? (
    <ul className="list-disc ml-5">
      <li>
        <a
          href={`/${selectedIncident.fileAttachment}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {selectedIncident.fileAttachment.split(/[/\\]/).pop()} {/* Display only the file name */}
        </a>
      </li>
    </ul>
  ) : (
    <p>No attachments available.</p>
  )}
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


      {/* Comments Section */}
    <div className="border rounded-lg p-4 shadow-md">
<h3 className="text-lg font-semibold mb-2">Comments</h3>
<ul className="list-disc ml-5 space-y-1">
{selectedIncident?.comments?.map((comment, index) => (
  <li key={index} className="mb-2">
    <p className="text-sm text-gray-700">
      <strong className="font-medium">{comment.author}:</strong> {comment.text}
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
className="bg-blue-500 text-white px-3 py-1 rounded mt-2 cursor-pointer hover:bg-blue-600 transition duration-200 m-10"
>
Add Comment
</button>
</div>
      {/* Modal Footer */}

    {/* Fixed Footer */}
    {/* <div className="absolute bottom-4 left-0 right-0 flex justify-end space-x-2 px-4"> */}
    <div className="absolute bottom-4 left-0 right-0 flex justify-end space-x-2 rounded-b-lg px-4 mt-6">
      <button
        onClick={onClose}
        className="bg-red-500 text-white py-2 px-4 rounded transition duration-150 hover:bg-red-600"
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
</div>









{selectedIncident.fileAttachment ? (
    <ul className="list-disc ml-5">
      {selectedIncident.fileAttachment.map((file, index) => (
        <li key={index}>
          <a
            href={`/${file}`} // Assuming `file` is a relative path
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {file.split(/[/\\]/).pop()} {/* Display only the file name */}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <p>No attachments available.</p>
  )}