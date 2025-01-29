import React from "react";

const InitialReportView = ({ report, reportType, incidentId }) => {
  if (!report) return <div className="text-center text-gray-500">No report selected</div>;

  return (
    <div className="bg-white p-8 m-4 max-w-[8.5in] min-h-[11in] border border-gray-300 shadow-lg font-sans leading-relaxed">
      <h1 className="text-2xl text-center uppercase mb-4">{reportType} - Case Reference: {report.caseReference}</h1>
      
      <section>
        <h2 className="text-xl mt-6 mb-2">Basic Information</h2>
        <p><strong>National Association:</strong> {report.nationalAssociation}</p>
        <p><strong>Incident Location:</strong> {report.incidentLocation}</p>
        <p><strong>Allegations Reported To:</strong> {report.allegationsReportedTo}</p>
        <p><strong>Reporter:</strong> {report.reporter}</p>
        <p><strong>Date of Incident:</strong> {new Date(report.dateOfIncident).toLocaleDateString()}</p>
      </section>

      <section>
        <h2 className="text-xl mt-6 mb-2">Allegations</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200">Allegation</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Type</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Safeguarding Area</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Next Steps</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Handled By</th>
            </tr>
          </thead>
          <tbody>
            {report.allegationTable?.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.allegation}</td>
                <td className="border border-gray-300 p-2">{item.type}</td>
                <td className="border border-gray-300 p-2">{item.safeguardingArea}</td>
                <td className="border border-gray-300 p-2">{item.nextSteps}</td>
                <td className="border border-gray-300 p-2">{item.handledBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl mt-6 mb-2">Risk Assessment</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200">Initial risk assessment</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Yes / No</th>
              <th className="border border-gray-300 p-2 bg-gray-200">Actions to be taken</th>
            </tr>
          </thead>
          <tbody>
        {report.riskAssessment?.map((item, index) => (
          <tr key={index} className="mt-4">
          <td className="border border-gray-300 p-2">{item.question}</td>
          <td className="border border-gray-300 p-2">{item.answer ? "Yes" : "No"}</td>
          <td className="border border-gray-300 p-2">{item.actions}</td>
        </tr>
        ))}
        </tbody>
        </table>
      </section>

      <footer className="mt-6 text-right text-sm">
        <p><strong>Conducted By:</strong> {report.misconductAssessment?.conductedBy}</p>
        <p><strong>Date:</strong> {new Date(report.misconductAssessment?.date).toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default InitialReportView;
