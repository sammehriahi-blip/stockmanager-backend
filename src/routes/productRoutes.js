const router = require('express').Router();
const c = require('../controllers/productController');

router.get('/', c.getProducts);
router.get('/:id', c.getProduct);
router.post('/', c.createProduct);
router.put('/:id', c.updateProduct);
router.patch('/:id/stock', c.updateStock);
router.delete('/:id', c.deleteProduct);

module.exports = router;
