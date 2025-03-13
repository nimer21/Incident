import React, { useEffect, useState } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FullAssessmentModal = ({ isOpen, onClose, incidentId, caseReference, reportData }) => {
  const reportType = "FullAssessment";
  const [formData, setFormData] = useState({
    caseId: '',
    nationalAssociation: '',
    incidentLocation: '',
    allegationsReportedTo: '',
    allegationsReceivedBy: '',
    reporter: '',
    reportingChannel: '',
    reporterContact: '',
    isOngoing: false,
    dateOfIncident: '',
    dateOfReceivingIncident: '',
    allegedVictim: '',
    allegedPerpetrator: '',
    monetaryDamage: 0,
    informedOthers: '',
    howReporterLearned: '',
    
    // Criminal act assessment
    reportingRequirements: [
      {
        question: 'Does the reported incident of misconduct fit to the criteria for a potential criminal act?',
        answer: false,
        comments: ''
      },
      {
        question: 'If yes, did SOS Palestine inform the relevant authorities e.g. MoSD in case of child abuse?',
        answer: false,
        comments: ''
      },
      {
        question: 'Did SOS Palestine inform the biological family of the child if obligated?',
        answer: false,
        comments: ''
      }
    ],
    
    // Allegations table
    allegationTable: [{
      allegation: '',
      immediateActions: '',
      evidenceCollected: '',
      nextSteps: '',
      finding: ''
    }],
    
    // Summary and recommendations
    summaryOfFindings: '',
    recommendations: '',
    
    // Assessment information
    misconductAssessment: {
      conductedBy: '',
      date: ''
    }
  });

  // Populate formData when reportData is available
  useEffect(() => {
    if (reportData) {
      setFormData(reportData);
    }
  }, [reportData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAllegationChange = (index, field, value) => {
    setFormData((prev) => {
      const newAllegations = prev.allegationTable.map((allegation, i) =>
        i === index ? { ...allegation, [field]: value } : allegation
      );
      return { ...prev, allegationTable: newAllegations };
    });
  };
  
  const handleReportingRequirementsChange = (index, field, value) => {
    setFormData(prev => {
      const newRequirements = [...prev.reportingRequirements];
      newRequirements[index] = { ...newRequirements[index], [field]: value };
      return { ...prev, reportingRequirements: newRequirements };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting data:", formData);
    
    try {
      let reportExists = false;
      let existingReport = null;

      // Format the data before sending
      const formattedData = {
        ...formData,
        allegationTable: formData.allegationTable.map(item => ({
          allegation: item.allegation || '',
          immediateActions: item.immediateActions || '',
          evidenceCollected: item.evidenceCollected || '',
          nextSteps: item.nextSteps || '',
          finding: item.finding || ''
        })),
        reportingRequirements: formData.reportingRequirements.map(item => ({
          question: item.question || '',
          answer: !!item.answer,
          comments: item.comments || ''
        })),
        misconductAssessment: {
          conductedBy: formData.misconductAssessment.conductedBy || '',
          date: formData.misconductAssessment.date ? new Date(formData.misconductAssessment.date) : null
        }
      };

      try {
        // Check if the report exists
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reports/${incidentId}/${reportType}`,
          { withCredentials: true }
        );
        reportExists = true; // Report exists if no error is thrown
        existingReport = response.data.report; // Store the report if it exists
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Report not found, creating a new one...");
          reportExists = false; // Report does not exist
          existingReport = null;
        } else {
          toast.error("Error fetching report");
          throw error; // Re-throw other errors
        }
      }
      
      if (existingReport) {
        // Report exists, update it
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/reports/${existingReport._id}`,
          {
            type: reportType,
            data: formData,
          },
          { withCredentials: true }
        );
        toast.success(`${reportType} updated successfully`);
      } else {
        // Report does not exist, create a new one
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/reports/create-report`,
          {
            type: reportType,
            incidentId,
            caseReference,
            data: formData,
          },
          { withCredentials: true }
        );
        toast.success(`${reportType} created successfully`);
      }
      onClose();      
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error("Error saving report");
    }
  };

  const addAllegation = () => {
    setFormData(prev => ({
      ...prev,
      allegationTable: [...prev.allegationTable, {
        allegation: '',
        immediateActions: '',
        evidenceCollected: '',
        nextSteps: '',
        finding: ''
      }]
    }));
  };

  const addReportingRequirement = () => {
    setFormData(prev => ({
      ...prev,
      reportingRequirements: [...prev.reportingRequirements, {
        question: '',
        answer: false,
        comments: ''
      }]
    }));
  };

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-4xl rounded bg-white p-6">
          <HeadlessDialog.Title className="text-2xl font-bold mb-4">
            Full Assessment - Case Reference: {caseReference}
          </HeadlessDialog.Title>
          
          {/* Add a scrollable container */}
          <div className="max-h-[80vh] overflow-y-auto">          
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Case ID</label>
                  <input
                    type="text"
                    name="caseId"
                    value={formData.caseId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">National Association</label>
                  <input
                    type="text"
                    name="nationalAssociation"
                    value={formData.nationalAssociation}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Incident Location</label>
                  <input
                    type="text"
                    name="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Allegations Reported To</label>
                  <input
                    type="text"
                    name="allegationsReportedTo"
                    value={formData.allegationsReportedTo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Allegations Received By</label>
                  <input
                    type="text"
                    name="allegationsReceivedBy"
                    value={formData.allegationsReceivedBy}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Reporter</label>
                  <input
                    type="text"
                    name="reporter"
                    value={formData.reporter}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Reporting Channel</label>
                  <input
                    type="text"
                    name="reportingChannel"
                    value={formData.reportingChannel}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Reporter Contact</label>
                  <input
                    type="text"
                    name="reporterContact"
                    value={formData.reporterContact}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Date of Incident</label>
                  <input
                    type="date"
                    name="dateOfIncident"
                    value={formData.dateOfIncident ? formData.dateOfIncident.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Date of Receiving Incident</label>
                  <input
                    type="date"
                    name="dateOfReceivingIncident"
                    value={formData.dateOfReceivingIncident ? formData.dateOfReceivingIncident.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Alleged Victim</label>
                  <input
                    type="text"
                    name="allegedVictim"
                    value={formData.allegedVictim}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Alleged Perpetrator</label>
                  <input
                    type="text"
                    name="allegedPerpetrator"
                    value={formData.allegedPerpetrator}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Monetary Damage (EUR)</label>
                  <input
                    type="number"
                    name="monetaryDamage"
                    value={formData.monetaryDamage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Is Incident Ongoing?</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOngoing"
                      checked={formData.isOngoing}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Informed Others</label>
                  <input
                    type="text"
                    name="informedOthers"
                    value={formData.informedOthers}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Has reporter informed anyone about the incident?"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">How Reporter Learned</label>
                  <input
                    type="text"
                    name="howReporterLearned"
                    value={formData.howReporterLearned}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="How did the reporter learn about the incident?"
                  />
                </div>
              </div>

              {/* Reporting Requirements */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Reporting Requirements</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100 text-left">Question</th>
                      <th className="border p-2 bg-gray-100 text-center w-24">Yes/No</th>
                      <th className="border p-2 bg-gray-100 text-left">Comments and Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.reportingRequirements.map((req, index) => (
                      <tr key={index}>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={req.question}
                            onChange={(e) => handleReportingRequirementsChange(index, 'question', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={req.answer}
                            onChange={(e) => handleReportingRequirementsChange(index, 'answer', e.target.checked)}
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={req.comments}
                            onChange={(e) => handleReportingRequirementsChange(index, 'comments', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addReportingRequirement}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Add Requirement
                </button>
              </div>

              {/* Allegations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Allegations</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100 text-left">Allegation</th>
                      <th className="border p-2 bg-gray-100 text-left">Immediate Actions</th>
                      <th className="border p-2 bg-gray-100 text-left">Evidence Collected</th>
                      <th className="border p-2 bg-gray-100 text-left">Next Steps</th>
                      <th className="border p-2 bg-gray-100 text-left">Finding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.allegationTable.map((allegation, index) => (
                      <tr key={index}>
                        <td className="border p-2">
                          <textarea
                            value={allegation.allegation}
                            onChange={(e) => handleAllegationChange(index, 'allegation', e.target.value)}
                            className="w-full p-1 border rounded"
                            rows="3"
                          />
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={allegation.immediateActions}
                            onChange={(e) => handleAllegationChange(index, 'immediateActions', e.target.value)}
                            className="w-full p-1 border rounded"
                            rows="3"
                          />
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={allegation.evidenceCollected}
                            onChange={(e) => handleAllegationChange(index, 'evidenceCollected', e.target.value)}
                            className="w-full p-1 border rounded"
                            rows="3"
                          />
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={allegation.nextSteps}
                            onChange={(e) => handleAllegationChange(index, 'nextSteps', e.target.value)}
                            className="w-full p-1 border rounded"
                            rows="3"
                          />
                        </td>
                        <td className="border p-2">
                          <select
                            value={allegation.finding}
                            onChange={(e) => handleAllegationChange(index, 'finding', e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Select...</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="partially confirmed">Partially Confirmed</option>
                            <option value="not confirmed">Not Confirmed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addAllegation}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Add Allegation
                </button>
              </div>

              {/* Summary and Recommendations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Summary of Findings</h3>
                <textarea
                  name="summaryOfFindings"
                  value={formData.summaryOfFindings}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  placeholder="In this section, summarize the findings for the reported allegations based on the conducted assessment."
                />
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  placeholder="Recommendations from the incident management team that conducted the assessment to the designated senior manager regarding the next steps."
                />
              </div>

              {/* Misconduct Assessment */}
              <section className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Misconduct Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="conductedBy" className="block mb-1">Conducted By</label>
                    <input 
                      type="text" 
                      name="conductedBy" 
                      id="conductedBy"
                      value={formData.misconductAssessment.conductedBy} 
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          misconductAssessment: {
                            ...prev.misconductAssessment,
                            conductedBy: e.target.value,
                          }
                        }))
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block mb-1">Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      id="date"
                      value={formData.misconductAssessment.date ? formData.misconductAssessment.date.split('T')[0] : ''} 
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          misconductAssessment: {
                            ...prev.misconductAssessment,
                            date: e.target.value,
                          }
                        }))
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </section>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration=200"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};

export default FullAssessmentModal;