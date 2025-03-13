const InitialReport = require("../models/InitialReport");
const FullAssessment = require("../models/FullAssessment");
const CaseClosureReport = require("../models/CaseClosureReport");
const ActionPlanReport = require("../models/ActionPlanReport");
const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");
const Incident = require("../models/Incident");
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
          data.allegationTable = data.allegationTable.map((allegation) => ({
            allegation: allegation.allegation || "",
            type: allegation.type || "",
            safeguardingArea: allegation.safeguardingArea || "",
            nextSteps: allegation.nextSteps || "",
            handledBy: allegation.handledBy || "",
          }));
        }

        // Convert riskAssessment to the correct format
        if (data.riskAssessment) {
          data.riskAssessment = data.riskAssessment.map((assessment) => ({
            question: assessment.question || "",
            answer: assessment.answer || false,
            actions: assessment.actions || "",
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
          data.misconductAssessment.date = new Date(
            data.misconductAssessment.date
          );
        }
        //newReport = new InitialReport(data);
        newReport = new InitialReport({ ...data, incidentId, caseReference });
        break;
      // case "FullAssessment":
      //   // Existing validation for FullAssessment
      //   if (data.riskAssessment) {
      //     data.riskAssessment = data.riskAssessment.map((assessment) => ({
      //       question: assessment.question || "",
      //       answer: assessment.answer || false,
      //       actions: assessment.actions || "",
      //     }));
      //   }
      //   newReport = new FullAssessment({ ...data, incidentId, caseReference });
      //   break;

      case "CaseClosure":
        // Validate required dates
        const requiredDates = [
          "incidentReportingDate",
          "incidentRegistrationDate",
          "incidentClosureDate",
        ];
        requiredDates.forEach((dateField) => {
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

        newReport = new CaseClosureReport({
          ...data,
          incidentId,
          caseReference,
        });
        break;

      // For the FullAssessment case in createReport function:
      case "FullAssessment":
        // Validate allegationTable
        if (
          !Array.isArray(data.allegationTable) ||
          !data.allegationTable.every(
            (item) =>
              typeof item === "object" &&
              "allegation" in item &&
              "immediateActions" in item &&
              "evidenceCollected" in item &&
              "nextSteps" in item &&
              "finding" in item
          )
        ) {
          return res.status(400).send("Invalid allegationTable format");
        }

        // Convert allegationTable to the correct format
        if (data.allegationTable) {
          data.allegationTable = data.allegationTable.map((allegation) => ({
            allegation: allegation.allegation || "",
            immediateActions: allegation.immediateActions || "",
            evidenceCollected: allegation.evidenceCollected || "",
            nextSteps: allegation.nextSteps || "",
            finding: allegation.finding || "",
          }));
        }

        // Convert reportingRequirements to the correct format
        if (data.reportingRequirements) {
          data.reportingRequirements = data.reportingRequirements.map(
            (req) => ({
              question: req.question || "",
              answer: req.answer || false,
              comments: req.comments || "",
            })
          );
        }

        // Format dates if they exist
        if (data.dateOfIncident) {
          data.dateOfIncident = new Date(data.dateOfIncident);
        }
        if (data.dateOfReceivingIncident) {
          data.dateOfReceivingIncident = new Date(data.dateOfReceivingIncident);
        }
        if (data.misconductAssessment?.date) {
          data.misconductAssessment.date = new Date(
            data.misconductAssessment.date
          );
        }

        newReport = new FullAssessment({ ...data, incidentId, caseReference });
        break;

      case "ActionPlan":
        // Validate action items format
        if (
          !Array.isArray(data.actionItems) ||
          !data.actionItems.every(
            (item) =>
              typeof item === "object" &&
              "type" in item &&
              "amount" in item &&
              "responsibleForImplementation" in item &&
              "timeframe" in item &&
              "status" in item &&
              "comments" in item
          )
        ) {
          return res.status(400).send("Invalid actionItems format");
        }

        // Format actionItems
        if (data.actionItems) {
          data.actionItems = data.actionItems.map((item) => ({
            type: item.type || "",
            amount: item.amount || "",
            responsibleForImplementation:
              item.responsibleForImplementation || "",
            timeframe: item.timeframe || "",
            status: item.status || "",
            comments: item.comments || "",
          }));
        }

        // Format dates if they exist
        if (data.misconductAssessment?.date) {
          data.misconductAssessment.date = new Date(
            data.misconductAssessment.date
          );
        }
        if (data.recipientDate) {
          data.recipientDate = new Date(data.recipientDate);
        }
        if (data.writerDate) {
          data.writerDate = new Date(data.writerDate);
        }

        newReport = new ActionPlanReport({
          ...data,
          incidentId,
          caseReference,
          //caseId: caseReference || incidentId  // Use caseReference or fallback to incidentId
        });
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

    // ✅ Handle anonymous users
    let userId = req.user?.userId || null;
    //let userId = req.user?._id || null;
    let performedBy = req.user?.role || "Anonymous";

    console.log("req.user?.userId: ", req.user?.userId);
    console.log("req.user: ", req.user);
    console.log("req.user.role: ", req.user?.role);

    // ✅ Log the report creation
    await logAudit(
      incidentId,
      userId,
      performedBy,
      `Report Submitted: ${type}`,
      `Case Reference: ${caseReference}`
    );

    res
      .status(201)
      .json({ message: `${type} created successfully`, report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.errors,
    });
  }
};

exports.getReport = async (req, res) => {
  const { incidentId, reportType } = req.params; // Extract dynamic parameters

  if (!incidentId || !reportType) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    let report;

    switch (reportType) {
      case "InitialReport":
        report = await InitialReport.findOne({ incidentId });
        break;
      case "FullAssessment":
        report = await FullAssessment.findOne({ incidentId });
        break;
      case "ActionPlan":
        report = await ActionPlanReport.findOne({ incidentId });
        break;
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
        case "ActionPlan":
        updatedReport = await ActionPlanReport.findByIdAndUpdate(
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
    res
      .status(200)
      .json({ message: "Report updated successfully", report: updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logAudit = async (incidentId, userId, role, action, details = "") => {
  try {
    if (!incidentId) {
      console.error("Audit logging failed: Missing incidentId");
      return;
    }
    const incident = await Incident.findById(incidentId);
    if (!incident) return; // Ensure incident exists
    // Handle anonymous users (no userId)
    const performedBy = userId ? new mongoose.Types.ObjectId(userId) : null;
    const performedByRole = role || "Anonymous";

    const auditEntry = new AuditLog({
      incidentId,
      caseReference: incident.caseReference, // Store case reference
      performedBy, // Can be null for anonymous users
      performedByRole: performedByRole,
      action,
      details,
      timestamp: new Date(),
    });

    await auditEntry.save();
  } catch (error) {
    console.error("Error logging audit:", error);
  }
};
