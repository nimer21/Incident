import React from "react";

const ActionPlanReportView = ({ report, reportType, incidentId }) => {
  if (!report) return <div className="text-center text-gray-500">No report selected</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-white p-8 m-4 max-w-[8.5in] min-h-[11in] border border-gray-300 shadow-lg font-sans leading-relaxed">
      <h1 className="text-2xl text-center uppercase mb-4">Individual Action Plan - Case Reference: {report.caseReference}</h1>
      
      <section className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Case ID:</strong> {report.caseReference}</p>
          <p><strong>National Association:</strong> {report.nationalAssociation}</p>
          <p><strong>Incident Location:</strong> {report.incidentLocation}</p>
          <p><strong>Allegations Reported To:</strong> {report.allegationsReportedTo}</p>
        </div>
        <div>
          <p><strong>Allegations Received By:</strong> {report.allegationsReceivedBy}</p>
          <p><strong>Support Recipient Name:</strong> {report.supportRecipientName}</p>
          <p><strong>Support Recipient's Relation to SOS:</strong> {report.supportRecipientRelation}</p>
        </div>
      </section>

      <section className="mb-6">
        <p><strong>Total Amount of Support:</strong> {report.totalSupportAmount}</p>
        <p><strong>Misconduct Assessment Conducted By:</strong> {report.misconductAssessment?.conductedBy} 
           {report.misconductAssessment?.date && ` on ${formatDate(report.misconductAssessment.date)}`}</p>
        <p><strong>Investigation Conducted:</strong> {report.investigationConducted || 'N/A'}</p>
        <p><strong>Duration of Support:</strong> {report.durationOfSupport}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl mt-6 mb-2">Action Items</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200">Type of Support</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Amount</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Responsible for Implementation</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Timeframe</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Status</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Comments/Updates</th>
            </tr>
          </thead>
          <tbody>
            {report.actionItems?.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.type}</td>
                <td className="border border-gray-300 p-2">{item.amount}</td>
                <td className="border border-gray-300 p-2">{item.responsibleForImplementation}</td>
                <td className="border border-gray-300 p-2">{item.timeframe}</td>
                <td className="border border-gray-300 p-2">{item.status}</td>
                <td className="border border-gray-300 p-2">{item.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-8 border-t pt-4">
        <div>
          <p><strong>Service Recipient:</strong> {report.serviceRecipient}</p>
          <p><strong>Date:</strong> {formatDate(report.recipientDate)}</p>
          <p><strong>Signature:</strong> {report.recipientSignature}</p>
        </div>
        <div>
          <p><strong>Name of Writer:</strong> {report.writerName}</p>
          <p><strong>Date:</strong> {formatDate(report.writerDate)}</p>
          <p><strong>Signature:</strong> {report.writerSignature}</p>
        </div>
      </section>

      <section className="mt-4">
        <p><strong>Approved By:</strong> {report.approvedBy}</p>
        <p><strong>Signature:</strong> {report.approvalSignature}</p>
      </section>
    </div>
  );
};

export default ActionPlanReportView;