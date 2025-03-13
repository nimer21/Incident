import React, { useEffect, useState } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActionPlanReportModal = ({ isOpen, onClose, incidentId, caseReference, reportData }) => {
  const reportType = "ActionPlan";
  const [formData, setFormData] = useState({
    nationalAssociation: '',
    incidentLocation: '',
    allegationsReportedTo: '',
    allegationsReceivedBy: '',
    supportRecipientName: '',
    supportRecipientRelation: '',
    totalSupportAmount: '',
    misconductAssessment: {
      conductedBy: '',
      date: ''
    },
    investigationConducted: '',
    durationOfSupport: '',
    actionItems: [
      {
        type: '',
        amount: '',
        responsibleForImplementation: '',
        timeframe: '',
        status: '',
        comments: ''
      }
    ],
    serviceRecipient: '',
    recipientDate: '',
    recipientSignature: '',
    writerName: '',
    writerDate: '',
    writerSignature: '',
    approvedBy: '',
    approvalSignature: ''
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

  const handleActionItemChange = (index, field, value) => {
    setFormData(prev => {
      const newActionItems = prev.actionItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, actionItems: newActionItems };
    });
  };

  const handleMisconductAssessmentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      misconductAssessment: {
        ...prev.misconductAssessment,
        [field]: value
      }
    }));
  };

  const addActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        {
          type: '',
          amount: '',
          responsibleForImplementation: '',
          timeframe: '',
          status: '',
          comments: ''
        }
      ]
    }));
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
        actionItems: formData.actionItems.map(item => ({
          type: item.type || '',
          amount: item.amount || '',
          responsibleForImplementation: item.responsibleForImplementation || '',
          timeframe: item.timeframe || '',
          status: item.status || '',
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
          toast.error("Error fetching action plan report", error);
          throw error; // Re-throw other errors
        }
      }

      if (existingReport) {
        // Report exists, update it | Update the existing report
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/reports/${existingReport._id}`,
          {
            type: reportType,
            data: formattedData,
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
            data: formattedData,
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

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-4xl rounded bg-white p-6">
          <HeadlessDialog.Title className="text-2xl font-bold mb-4">
            Individual Action Plan - Case Reference: {caseReference}
          </HeadlessDialog.Title>
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information Fields */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Support Recipient Name</label>
                  <input
                    type="text"
                    name="supportRecipientName"
                    value={formData.supportRecipientName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Support Recipient's Relation to SOS</label>
                  <input
                    type="text"
                    name="supportRecipientRelation"
                    value={formData.supportRecipientRelation}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Total Amount of Support (Local Currency/EURO)</label>
                  <input
                    type="text"
                    name="totalSupportAmount"
                    value={formData.totalSupportAmount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Duration of Support</label>
                  <input
                    type="text"
                    name="durationOfSupport"
                    value={formData.durationOfSupport}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Misconduct Assessment */}
              <section className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Misconduct Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Conducted By</label>
                    <input
                      type="text"
                      value={formData.misconductAssessment.conductedBy}
                      onChange={(e) => handleMisconductAssessmentChange('conductedBy', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.misconductAssessment.date ? formData.misconductAssessment.date.split('T')[0] : ''}
                      onChange={(e) => handleMisconductAssessmentChange('date', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </section>

              <div>
                <label className="block mb-1">Investigation Conducted (if any)</label>
                <textarea
                  name="investigationConducted"
                  value={formData.investigationConducted}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>

              {/* Action Items Table */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-100">Type of Support</th>
                        <th className="border p-2 bg-gray-100">Amount</th>
                        <th className="border p-2 bg-gray-100">Responsible for Implementation</th>
                        <th className="border p-2 bg-gray-100">Timeframe</th>
                        <th className="border p-2 bg-gray-100">Status</th>
                        <th className="border p-2 bg-gray-100">Comments/Updates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.actionItems.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={item.type}
                              onChange={(e) => handleActionItemChange(index, 'type', e.target.value)}
                              className="w-full p-1"
                              placeholder="Type of support"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleActionItemChange(index, 'amount', e.target.value)}
                              className="w-full p-1"
                              placeholder="Amount"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={item.responsibleForImplementation}
                              onChange={(e) => handleActionItemChange(index, 'responsibleForImplementation', e.target.value)}
                              className="w-full p-1"
                              placeholder="Person responsible"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={item.timeframe}
                              onChange={(e) => handleActionItemChange(index, 'timeframe', e.target.value)}
                              className="w-full p-1"
                              placeholder="Timeframe"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={item.status}
                              onChange={(e) => handleActionItemChange(index, 'status', e.target.value)}
                              className="w-full p-1"
                              placeholder="Status"
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={item.comments}
                              onChange={(e) => handleActionItemChange(index, 'comments', e.target.value)}
                              className="w-full p-1"
                              placeholder="Comments/Updates"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addActionItem}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Add Action Item
                </button>
              </div>

              {/* Signatures Section */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Service Recipient</label>
                  <input
                    type="text"
                    name="serviceRecipient"
                    value={formData.serviceRecipient}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Recipient Date</label>
                  <input
                    type="date"
                    name="recipientDate"
                    value={formData.recipientDate ? formData.recipientDate.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Recipient Signature (Textual representation)</label>
                <input
                  type="text"
                  name="recipientSignature"
                  value={formData.recipientSignature}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Name of Writer</label>
                  <input
                    type="text"
                    name="writerName"
                    value={formData.writerName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Writer Date</label>
                  <input
                    type="date"
                    name="writerDate"
                    value={formData.writerDate ? formData.writerDate.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Writer Signature (Textual representation)</label>
                <input
                  type="text"
                  name="writerSignature"
                  value={formData.writerSignature}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Approved By</label>
                  <input
                    type="text"
                    name="approvedBy"
                    value={formData.approvedBy}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Approval Signature (Textual representation)</label>
                  <input
                    type="text"
                    name="approvalSignature"
                    value={formData.approvalSignature}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  Save Action Plan
                </button>
              </div>
            </form>
          </div>
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};

export default ActionPlanReportModal;