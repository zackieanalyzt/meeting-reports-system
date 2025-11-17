const db = require('../database');

// Audit logging middleware
const auditLog = async (username, action, resourceType = null, resourceId = null, details = null, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await db.query(
      `INSERT INTO audit_logs (username, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [username, action, resourceType, resourceId, details ? JSON.stringify(details) : null, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error - audit logging should not break the main flow
  }
};

// Middleware to log view actions
const logView = (resourceType) => {
  return async (req, res, next) => {
    if (req.user) {
      const resourceId = req.params.id || null;
      await auditLog(req.user.username, 'view', resourceType, resourceId, null, req);
    }
    next();
  };
};

// Middleware to log download actions
const logDownload = async (req, res, next) => {
  if (req.user) {
    const resourceId = req.params.id || null;
    const resourceType = req.baseUrl.includes('meeting') ? 'meeting_report' : 'agenda';
    await auditLog(req.user.username, 'download', resourceType, resourceId, null, req);
  }
  next();
};

module.exports = {
  auditLog,
  logView,
  logDownload
};
