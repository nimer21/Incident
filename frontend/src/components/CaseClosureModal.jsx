import React, { useEffect, useState } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CaseClosureModal = ({ isOpen, onClose, incidentId, caseReference, reportData }) => {
  const [formData, setFormData] = useState({
    incidentReportingDate: '',
    incidentRegistrationDate: '',
    incidentClosureDate: '',
    reasonsForClosure: '',
    implementedActions: '',
    followUpPlans: '',
    isReporterAwareOfClosure: false,
    incidentManager: {
      name: '',
      function: '',
      date: ''
    },
    approvedBy: {
      name: '',
      function: '',
      date: ''
    }
  });

  useEffect(() => {
    if (reportData) {
      // Format dates for form inputs
      const formattedData = {
        ...reportData,
        incidentReportingDate: reportData.incidentReportingDate?.split('T')[0] || '',
        incidentRegistrationDate: reportData.incidentRegistrationDate?.split('T')[0] || '',
        incidentClosureDate: reportData.incidentClosureDate?.split('T')[0] || '',
        incidentManager: {
          ...reportData.incidentManager,
          date: reportData.incidentManager?.date?.split('T')[0] || ''
        },
        approvedBy: {
          ...reportData.approvedBy,
          date: reportData.approvedBy?.date?.split('T')[0] || ''
        }
      };
      setFormData(formattedData);
    }
  }, [reportData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleManagerChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      incidentManager: {
        ...prev.incidentManager,
        [name]: value
      }
    }));
  };

  const handleApproverChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      approvedBy: {
        ...prev.approvedBy,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = reportData?._id 
        ? `${import.meta.env.VITE_API_URL}/api/reports/${reportData._id}`
        : `${import.meta.env.VITE_API_URL}/api/reports/create-report`;
      
      const method = reportData?._id ? 'put' : 'post';
      const payload = reportData?._id 
        ? { type: 'CaseClosure', data: formData }
        : { type: 'CaseClosure', incidentId, caseReference, data: formData };

      await axios[method](endpoint, payload, { withCredentials: true });
      
      toast.success(`Case Closure ${reportData?._id ? 'updated' : 'created'} successfully`);
      onClose();
    } catch (error) {
      console.error('Error saving Case Closure report:', error);
      toast.error("Error saving Case Closure report");
    }
  };

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-4xl rounded bg-white p-6">
          <HeadlessDialog.Title className="text-2xl font-bold mb-4">
            Case Closure Report - Case Reference: {caseReference}
          </HeadlessDialog.Title>
          
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dates Section */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Incident Reporting Date</label>
                  <input
                    type="date"
                    name="incidentReportingDate"
                    value={formData.incidentReportingDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Incident Registration Date</label>
                  <input
                    type="date"
                    name="incidentRegistrationDate"
                    value={formData.incidentRegistrationDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Incident Closure Date</label>
                  <input
                    type="date"
                    name="incidentClosureDate"
                    value={formData.incidentClosureDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Reasons and Actions Section */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Reasons for Closure</label>
                  <textarea
                    name="reasonsForClosure"
                    value={formData.reasonsForClosure}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Implemented Actions</label>
                  <textarea
                    name="implementedActions"
                    value={formData.implementedActions}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Follow Up Plans</label>
                  <textarea
                    name="followUpPlans"
                    value={formData.followUpPlans}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                </div>
              </div>

              {/* Reporter Awareness Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isReporterAwareOfClosure"
                  checked={formData.isReporterAwareOfClosure}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <label>Is the reporter aware of the case closure?</label>
              </div>

              {/* Manager and Approver Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Incident Manager</h3>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.incidentManager.name}
                    onChange={handleManagerChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="function"
                    placeholder="Function"
                    value={formData.incidentManager.function}
                    onChange={handleManagerChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={formData.incidentManager.date}
                    onChange={handleManagerChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Approved By</h3>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.approvedBy.name}
                    onChange={handleApproverChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="function"
                    placeholder="Function"
                    value={formData.approvedBy.function}
                    onChange={handleApproverChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={formData.approvedBy.date}
                    onChange={handleApproverChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
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

export default CaseClosureModal;