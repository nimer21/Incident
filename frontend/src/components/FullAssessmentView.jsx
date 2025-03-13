import React from "react";

const FullAssessmentView = ({ report, reportType, incidentId }) => {
  if (!report) return <div className="text-center text-gray-500">No report selected</div>;
  console.log(report);

  return (
    <div className="bg-white p-8 m-4 max-w-[8.5in] min-h-[11in] border border-gray-300 shadow-lg font-sans leading-relaxed">
      <h1 className="text-2xl text-center uppercase mb-4">{reportType} - Case Reference: {report.caseReference}</h1>
      
      {/* Basic Information Section */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Case ID:</strong> {report.caseId}</p>
          <p><strong>National Association:</strong> {report.nationalAssociation}</p>
          <p><strong>Incident Location:</strong> {report.incidentLocation}</p>
          <p><strong>Allegations Reported To:</strong> {report.allegationsReportedTo}</p>
          <p><strong>Allegations Received By:</strong> {report.allegationsReceivedBy}</p>
          <p><strong>Reporter:</strong> {report.reporter}</p>
        </div>
        <div>
          <p><strong>Reporting Channel:</strong> {report.reportingChannel}</p>
          <p><strong>Reporter Contact:</strong> {report.reporterContact}</p>
          <p><strong>Is Ongoing:</strong> {report.isOngoing ? "Yes" : "No"}</p>
          <p><strong>Date of Incident:</strong> {report.dateOfIncident ? new Date(report.dateOfIncident).toLocaleDateString() : "N/A"}</p>
          <p><strong>Date of Receiving Incident:</strong> {report.dateOfReceivingIncident ? new Date(report.dateOfReceivingIncident).toLocaleDateString() : "N/A"}</p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p><strong>Alleged Victim:</strong> {report.allegedVictim}</p>
          <p><strong>Alleged Perpetrator:</strong> {report.allegedPerpetrator}</p>
        </div>
        <div>
          <p><strong>Monetary Damage (EUR):</strong> {report.monetaryDamage}</p>
          <p><strong>Informed Others:</strong> {report.informedOthers}</p>
          <p><strong>Knowledge Source:</strong> {report.knowledgeSource}</p>
          <p><strong>Initial Assessment Conducted:</strong> {report.initialAssessmentConducted}</p>
        </div>
      </section>

      {/* Reporting Requirements Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Reporting Requirements</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 text-left">Requirement</th>
              <th className="border border-gray-300 p-2 bg-gray-200 text-center w-24">Yes / No</th>
              <th className="border border-gray-300 p-2 bg-gray-200 text-left">Comments and actions taken</th>
            </tr>
          </thead>
          <tbody>
            {report.reportingRequirements?.map((req, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{req.question}</td>
                <td className="border border-gray-300 p-2 text-center">{req.answer ? "Yes" : "No"}</td>
                <td className="border border-gray-300 p-2">{req.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Allegations Table */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Allegations</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200">Allegation</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Immediate actions needed</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Evidence collected</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Next steps in response</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Finding</th>
            </tr>
          </thead>
          <tbody>
            {report.allegationTable?.map((allegation, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2 align-top">{allegation.allegation}</td>
                <td className="border border-gray-300 p-2 align-top">{allegation.immediateActions}</td>
                <td className="border border-gray-300 p-2 align-top">{allegation.evidenceCollected}</td>
                <td className="border border-gray-300 p-2 align-top">{allegation.nextSteps}</td>
                <td className="border border-gray-300 p-2 align-top capitalize">{allegation.finding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Summary of Findings */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Summary of Findings</h2>
        <div className="border border-gray-300 p-4 rounded bg-gray-50">
          <p style={{ whiteSpace: 'pre-line' }}>{report.summaryOfFindings}</p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
        <div className="border border-gray-300 p-4 rounded bg-gray-50">
          <p style={{ whiteSpace: 'pre-line' }}>{report.recommendations}</p>
        </div>
      </section>

      {/* Misconduct Assessment Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Misconduct Assessment</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 text-left">Conducted By</th>
              <th className="border border-gray-300 p-2 bg-gray-200 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{report.misconductAssessment?.conductedBy || "N/A"}</td>
              <td className="border border-gray-300 p-2">
                {report.misconductAssessment?.date ? new Date(report.misconductAssessment.date).toLocaleDateString() : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};
export default FullAssessmentView;