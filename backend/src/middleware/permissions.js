// Role-based permission middleware

// Check if user has secretary role
const requireSecretary = (req, res, next) => {
  if (req.user.role !== 'secretary') {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะเจ้าหน้าที่ธุรการ)'
    });
  }
  next();
};

// Check if user has secretary or manager role
const requireSecretaryOrManager = (req, res, next) => {
  if (req.user.role !== 'secretary' && req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะเจ้าหน้าที่ธุรการและหัวหน้ากลุ่มงาน)'
    });
  }
  next();
};

// Check if user can modify resource (owner or secretary)
const canModifyResource = (createdBy) => {
  return (req, res, next) => {
    if (req.user.role === 'secretary' || req.user.username === createdBy) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้'
      });
    }
  };
};

module.exports = {
  requireSecretary,
  requireSecretaryOrManager,
  canModifyResource
};
