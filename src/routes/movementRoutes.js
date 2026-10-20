const router = require('express').Router();
const { getMovements } = require('../controllers/movementController');

router.get('/', getMovements);

module.exports = router;
