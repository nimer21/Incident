const InitialReport = require("../models/InitialReport");
const FullAssessment = require("../models/FullAssessment");
const CaseClosureReport = require("../models/CaseClosureReport");
// Import other models as needed

exports.createReport = async (req, res) => {
  try {
    const { type, incidentId, caseReference, data } = req.body;

    let newReport;

    switch (type) {
      case "InitialReport":
        // Existing validation for InitialReport
         // Validate allegationTable
    if (
      !Array.isArray(data.allegationTable) ||
      !data.allegationTable.every(
        (item) =>
          typeof item === "object" &&
          "allegation" in item &&
          "type" in item &&
          "safeguardingArea" in item &&
          "nextSteps" in item &&
          "handledBy" in item
      )
    ) {
      return res.status(400).send("Invalid allegationTable format");
    }
        // Convert allegationTable to the correct format
    if (data.allegationTable) {
      data.allegationTable = data.allegationTable.map(allegation => ({
        allegation: allegation.allegation || '',
        type: allegation.type || '',
        safeguardingArea: allegation.safeguardingArea || '',
        nextSteps: allegation.nextSteps || '',
        handledBy: allegation.handledBy || ''
      }));
    }

    // Convert riskAssessment to the correct format
    if (data.riskAssessment) {
      data.riskAssessment = data.riskAssessment.map(assessment => ({
        question: assessment.question || '',
        answer: assessment.answer || false,
        actions: assessment.actions || ''
      }));
    }

    // Format dates if they exist
    if (data.dateOfIncident) {
      data.dateOfIncident = new Date(data.dateOfIncident);
    }
    if (data.dateOfReceivingIncident) {
      data.dateOfReceivingIncident = new Date(data.dateOfReceivingIncident);
    }
    if (data.misconductAssessment?.date) {
      data.misconductAssessment.date = new Date(data.misconductAssessment.date);
    }
        //newReport = new InitialReport(data);
        newReport = new InitialReport({ ...data, incidentId, caseReference });
        break;
      case "FullAssessment":
        // Existing validation for FullAssessment
        if (data.riskAssessment) {
          data.riskAssessment = data.riskAssessment.map(assessment => ({
            question: assessment.question || '',
            answer: assessment.answer || false,
            actions: assessment.actions || ''
          }));
        }
        newReport = new FullAssessment({ ...data, incidentId, caseReference });
        break;

        case "CaseClosure":
        // Validate required dates
        const requiredDates = ['incidentReportingDate', 'incidentRegistrationDate', 'incidentClosureDate'];
        requiredDates.forEach(dateField => {
          if (data[dateField]) {
            data[dateField] = new Date(data[dateField]);
          }
        });

        // Validate manager and approver dates
        if (data.incidentManager?.date) {
          data.incidentManager.date = new Date(data.incidentManager.date);
        }
        if (data.approvedBy?.date) {
          data.approvedBy.date = new Date(data.approvedBy.date);
        }

        newReport = new CaseClosureReport({ ...data, incidentId, caseReference });
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    // if (type === "InitialReport") {
    //   newReport = new InitialReport({ ...data, incidentId, caseReference });
    // } else if (type === "Full Assessment") {
    //   newReport = new FullAssessment({ ...data, incidentId, caseReference });
    // } else {
    //   return res.status(400).json({ message: "Invalid report type" });
    // }

    await newReport.save();
    res.status(201).json({ message: `${type} created successfully`, report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      details: error.errors
     });
  }
};

exports.getReport = async (req, res) => {
    const { incidentId, reportType } = req.params; // Extract dynamic parameters
    
    if (!incidentId ||!reportType) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

  
    try {
      let report;

      switch (reportType) {
        case "InitialReport":
          report = await InitialReport.findOne({ incidentId });
          break;
        // case "FullAssessment":
        //   report = await FullAssessment.findOne({ incidentId });
        //   break;
        case "CaseClosure":
          report = await CaseClosureReport.findOne({ incidentId });
          break;
        default:
          return res.status(400).json({ message: "Invalid report type" });
      }
  
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      res.status(200).json({ report });
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.updateReport = async (req, res) => {
    const { reportId } = req.params;
    const { type, data } = req.body;
  
    try {
      let updatedReport;
    switch (type) {
      case "InitialReport":
        updatedReport = await InitialReport.findByIdAndUpdate(
          reportId,
          { ...data },
          { new: true }
        );
        break;
      case "FullAssessment":
        updatedReport = await FullAssessment.findByIdAndUpdate(
          reportId,
          { ...data },
          { new: true }
        );
        break;
      case "CaseClosure":
        updatedReport = await CaseClosureReport.findByIdAndUpdate(
          reportId,
          { ...data },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }
      res.status(200).json({ message: "Report updated successfully", report: updatedReport });
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
