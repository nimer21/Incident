import React from 'react';

const CaseClosureReportView = ({ report, reportType, incidentId }) => {
  if (!report) return <div className="text-center text-gray-500">No report selected</div>;
  console.log(report);

  return (
    <div className="bg-white p-8 m-4 max-w-[8.5in] min-h-[11in] border border-gray-300 shadow-lg font-sans leading-relaxed">
      <h1 className="text-2xl text-center uppercase mb-4">
        Case Closure Report - Case Reference: {report.caseReference}
      </h1>

      {/* Incident Information Section */}
      <section>
        <h2 className="text-xl mt-6 mb-2">Incident Information</h2>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            <p><strong>Incident/Complaint reporting date:</strong> {new Date(report.incidentReportingDate).toLocaleDateString()}</p>
            <p><strong>Incident/Complaint Register ID:</strong> {report.caseReference}</p>
            <p><strong>Incident registration date:</strong> {new Date(report.incidentRegistrationDate).toLocaleDateString()}</p>
            <p><strong>Incident closure date:</strong> {new Date(report.incidentClosureDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right" dir="rtl">
            <p><strong>تاريخ التبليغ عن الحادثة:</strong> {new Date(report.incidentReportingDate).toLocaleDateString('ar')}</p>
            <p><strong>رقم الشكوى:</strong> {report.caseReference}</p>
            <p><strong>تاريخ تسجيل الشكوى:</strong> {new Date(report.incidentRegistrationDate).toLocaleDateString('ar')}</p>
            <p><strong>تاريخ إغلاق الحادثة:</strong> {new Date(report.incidentClosureDate).toLocaleDateString('ar')}</p>
          </div>
        </div>
      </section>

      {/* Closure Reasons Section */}
      <section>
        <h2 className="text-xl mt-6 mb-2">Reasons for Closure</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2">Reasons for closure</th>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2 text-right" dir="rtl">أسباب الإغلاق</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{report.reasonsForClosure}</td>
              <td className="border border-gray-300 p-2 text-right" dir="rtl">{report.reasonsForClosure}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Actions Implemented Section */}
      <section>
        <h2 className="text-xl mt-6 mb-2">Actions Implemented</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2">Actions implemented as defined in the action plan</th>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2 text-right" dir="rtl">الإجراءات التي تم تنفيذها بناء على الخطة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{report.implementedActions}</td>
              <td className="border border-gray-300 p-2 text-right" dir="rtl">{report.implementedActions}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Follow-up Plans Section */}
      <section>
        <h2 className="text-xl mt-6 mb-2">Follow-up Plans</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2">Follow up or other plans</th>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2 text-right" dir="rtl">المتابعة أو إجراءات أخرى</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{report.followUpPlans}</td>
              <td className="border border-gray-300 p-2 text-right" dir="rtl">{report.followUpPlansAr}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Reporter Awareness Section */}
      <section>
        <h2 className="text-xl mt-6 mb-2">Reporter Awareness</h2>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2">Is the reporter aware of the case closure</th>
              <th className="border border-gray-300 p-2 bg-gray-200 w-1/2 text-right" dir="rtl">هل المبلغ على علم بالإغلاق؟</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{report.isReporterAwareOfClosure ? "Yes" : "No"}</td>
              <td className="border border-gray-300 p-2 text-right" dir="rtl">{report.isReporterAwareOfClosure ? "نعم" : "لا"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Approval Section */}
      <section className="mt-8 grid grid-cols-2 gap-x-8">
        <div>
          <p><strong>Date:</strong> {new Date(report.approvedBy?.date).toLocaleDateString()}</p>
          <p><strong>Incident Manager:</strong> {report.incidentManager?.name} - {report.incidentManager?.function}</p>
          <p><strong>Approved by:</strong> {report.approvedBy?.name}</p>
        </div>
        <div className="text-right" dir="rtl">
          <p><strong>التاريخ:</strong> {new Date(report.approvedBy?.date).toLocaleDateString('ar')}</p>
          <p><strong>مدير الحوادث:</strong> {report.incidentManager?.name} - {report.incidentManager?.function}</p>
          <p><strong>تمت الموافقة عليه بواسطة:</strong> {report.approvedBy?.name}</p>
        </div>
      </section>
    </div>
  );
};

export default CaseClosureReportView;