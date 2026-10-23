const workflow = require("../services/organizerWorkflow.service");
const { notifyProgressChange } = require("../services/organizerProgressNotify.service");

const fail = (res, err, fallback) =>
  res.status(err.statusCode || 500).json({ message: err.message || fallback });

const posInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// GET /api/organizers/my-assignments/:assignmentId
const getAssignmentDetailHandler = async (req, res) => {
  try {
    const id = posInt(req.params.assignmentId);
    if (!id) return res.status(400).json({ message: "Invalid assignment id" });
    res.status(200).json(await workflow.getAssignmentDetail(req.user.id, id));
  } catch (err) {
    fail(res, err, "Failed to fetch event details");
  }
};

// PATCH /api/organizers/my-assignments/:assignmentId/progress   { status }
const updateProgressHandler = async (req, res) => {
  try {
    const id = posInt(req.params.assignmentId);
    if (!id) return res.status(400).json({ message: "Invalid assignment id" });
    const { status } = req.body || {};
    if (status !== "in_progress" && status !== "completed") {
      return res
        .status(400)
        .json({ message: "status must be 'in_progress' or 'completed'" });
    }
    const assignment = await workflow.updateProgress(req.user.id, id, status);
    // Fire-and-forget: email/SMS problems must never fail the progress update
    notifyProgressChange(id, status).catch(() => {});
    res.status(200).json({
      message: status === "completed" ? "Event marked as completed" : "Event marked as in progress",
      assignment,
    });
  } catch (err) {
    fail(res, err, "Failed to update progress");
  }
};

// POST /api/organizers/my-assignments/:assignmentId/checklist   { category, itemName }
const addChecklistItemHandler = async (req, res) => {
  try {
    const id = posInt(req.params.assignmentId);
    if (!id) return res.status(400).json({ message: "Invalid assignment id" });
    const { category, itemName } = req.body || {};
    if (!workflow.CHECKLIST_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `category must be one of: ${workflow.CHECKLIST_CATEGORIES.join(", ")}`,
      });
    }
    const name = typeof itemName === "string" ? itemName.trim() : "";
    if (name.length === 0 || name.length > 150) {
      return res.status(400).json({ message: "itemName must be 1 to 150 characters" });
    }
    const item = await workflow.addChecklistItem(req.user.id, id, category, name);
    res.status(201).json({ message: "Checklist item added", item });
  } catch (err) {
    fail(res, err, "Failed to add checklist item");
  }
};

// PATCH /api/organizers/my-assignments/:assignmentId/checklist/:itemId   { isDone }
const toggleChecklistItemHandler = async (req, res) => {
  try {
    const id = posInt(req.params.assignmentId);
    const itemId = posInt(req.params.itemId);
    if (!id || !itemId) return res.status(400).json({ message: "Invalid id" });
    const { isDone } = req.body || {};
    if (typeof isDone !== "boolean") {
      return res.status(400).json({ message: "isDone must be true or false" });
    }
    const item = await workflow.setChecklistItemDone(req.user.id, id, itemId, isDone);
    res.status(200).json({ item });
  } catch (err) {
    fail(res, err, "Failed to update checklist item");
  }
};

// DELETE /api/organizers/my-assignments/:assignmentId/checklist/:itemId
const deleteChecklistItemHandler = async (req, res) => {
  try {
    const id = posInt(req.params.assignmentId);
    const itemId = posInt(req.params.itemId);
    if (!id || !itemId) return res.status(400).json({ message: "Invalid id" });
    await workflow.deleteChecklistItem(req.user.id, id, itemId);
    res.status(200).json({ message: "Checklist item removed" });
  } catch (err) {
    fail(res, err, "Failed to remove checklist item");
  }
};

module.exports = {
  getAssignmentDetailHandler,
  updateProgressHandler,
  addChecklistItemHandler,
  toggleChecklistItemHandler,
  deleteChecklistItemHandler,
};
