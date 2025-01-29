import React, { useEffect, useState } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-toastify';


const InitialReportModal = ({ isOpen, onClose, incidentId, caseReference, reportData }) => {
  const reportType = "InitialReport";
  const [formData, setFormData] = useState({
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
    knowledgeSource: '',
    gcInformed: false,
    allegationTable: [{
      allegation: '',
      type: '',
      safeguardingArea: '',
      nextSteps: '',
      handledBy: ''
    }],
    riskAssessment: [{
      question: '',
      answer: false,
      actions: ''
    }],
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

  // const handleAllegationChange = (index, field, value) => {
  //   setFormData(prev => {
  //     const newAllegations = [...prev.allegationTable];
  //     newAllegations[index] = { ...newAllegations[index], [field]: value };
  //     return { ...prev, allegationTable: newAllegations };
  //   });
  // };

  const handleAllegationChange = (index, field, value) => {
    setFormData((prev) => {
      const newAllegations = prev.allegationTable.map((allegation, i) =>
        i === index ? { ...allegation, [field]: value } : allegation
      );
      return { ...prev, allegationTable: newAllegations };
    });
  };
  
  const handleRiskAssessmentChange = (index, field, value) => {
    setFormData(prev => {
      const newAssessments = [...prev.riskAssessment];
      newAssessments[index] = { ...newAssessments[index], [field]: value };
      return { ...prev, riskAssessment: newAssessments };
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
        type: item.type || '',
        safeguardingArea: item.safeguardingArea || '',
        nextSteps: item.nextSteps || '',
        handledBy: item.handledBy || ''
      })),
      riskAssessment: formData.riskAssessment.map(item => ({
        question: item.question || '',
        answer: !!item.answer,
        actions: item.actions || ''
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
        toast.error("Error fetching frontend report", error);
        throw error; // Re-throw other errors
      }
    }
    if (existingReport) {
      // Report exists, update it | Update the existing report
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
        type: '',
        safeguardingArea: '',
        nextSteps: '',
        handledBy: ''
      }]
    }));
  };

  const addRiskAssessment = () => {
    setFormData(prev => ({
      ...prev,
      riskAssessment: [...prev.riskAssessment, {
        question: '',
        answer: false,
        actions: ''
      }]
    }));
  };

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-4xl rounded bg-white p-6">
          <HeadlessDialog.Title className="text-2xl font-bold mb-4">
          Initial Report - Case Reference: {caseReference}
          </HeadlessDialog.Title>
          {/* Add a scrollable container */}
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

              {/* More fields can be added similarly */}
              {/* Add other fields like reporter, reporting channel etc. */}

            {/* Allegations Table */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Allegations</h3>
              {formData.allegationTable.map((allegation, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                  <input
                    placeholder="Allegation"
                    value={allegation.allegation}
                    onChange={(e) => handleAllegationChange(index, 'allegation', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    placeholder="Type"
                    value={allegation.type}
                    onChange={(e) => handleAllegationChange(index, 'type', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    placeholder="Safeguarding Area"
                    value={allegation.safeguardingArea}
                    onChange={(e) => handleAllegationChange(index, 'safeguardingArea', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    placeholder="Next Steps"
                    value={allegation.nextSteps}
                    onChange={(e) => handleAllegationChange(index, 'nextSteps', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    placeholder="Handled By"
                    value={allegation.handledBy}
                    onChange={(e) => handleAllegationChange(index, 'handledBy', e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addAllegation}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Add Allegation
              </button>
            </div>

            {/* Risk Assessment */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
              {formData.riskAssessment.map((assessment, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    placeholder="Question"
                    value={assessment.question}
                    onChange={(e) => handleRiskAssessmentChange(index, 'question', e.target.value)}
                    className="p-2 border rounded col-span-2"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessment.answer}
                      onChange={(e) => handleRiskAssessmentChange(index, 'answer', e.target.checked)}
                      className="mr-2"
                    />
                    <span>Yes/No</span>
                  </div>
                  <input
                    placeholder="Actions"
                    value={assessment.actions}
                    onChange={(e) => handleRiskAssessmentChange(index, 'actions', e.target.value)}
                    className="p-2 border rounded col-span-3"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addRiskAssessment}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Add Risk Assessment
              </button>
            </div>

            {/* Misconduct Assessment */}
            <section className='mt-4'>
                <h3 className='text-lg font-semibold mb-2'>Misconduct Assessment</h3>
                <div>
                  <label htmlFor='conductedBy' className='block mb-1'>Conducted By</label>
                  <input 
                    type='text' 
                    name='conductedBy' 
                    id='conductedBy'
                    value={formData.misconductAssessment.conductedBy} 
                    onChange={(e) =>
                        setFormData(prev => ({
                            ...prev,
                            misconductAssessment:{
                                ...prev.misconductAssessment,
                                conductedBy:e.target.value,
                            }
                        }))
                     }
                     className='w-full p-2 border rounded'
                   />
                 </div>

                 <div>
                   <label htmlFor='date' className='block mb-1'>Date</label>
                   <input 
                     type='date' 
                     name='date' 
                     id='date'
                     value={formData.misconductAssessment.date ? formData.misconductAssessment.date.split('T')[0] : ''} 
                     onChange={(e) =>
                         setFormData(prev => ({
                             ...prev,
                             misconductAssessment:{
                                 ...prev.misconductAssessment,
                                 date:e.target.value,
                             }
                         }))
                     }
                     className='w-full p-2 border rounded'
                   />
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

export default InitialReportModal;