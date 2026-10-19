const { createBackup, listBackups, deleteBackup } = require("../services/backup.service");

exports.runBackupHandler = async (req, res) => {
  try {
    const data = await createBackup();
    res.status(201).json({ success: true, data, message: "Backup created" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.listBackupsHandler = async (req, res) => {
  try {
    res.json({ success: true, data: await listBackups() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.deleteBackupHandler = async (req, res) => {
  try {
    const data = await deleteBackup(req.params.file);
    res.json({ success: true, data, message: "Backup deleted" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};