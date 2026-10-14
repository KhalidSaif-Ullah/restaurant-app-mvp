
const express = require('express');
const router = express.Router();

const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');

const authMiddleware = require('../middleware/authMiddleware');

const managerOnly = (req, res, next) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ message: 'Manager access required' });
  }

  next();
};

router.get('/', authMiddleware, getTables);
router.post('/', authMiddleware, managerOnly, createTable);
router.patch('/:id', authMiddleware, managerOnly, updateTable);
router.delete('/:id', authMiddleware, managerOnly, deleteTable);

module.exports = router;
