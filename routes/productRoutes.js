const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, upload } = require('../controllers/productController');
const Product = require('../models/productModel');

// Route to create a product with image uploads
router.post('/products', upload.array('images'), createProduct);

// Route to update a product with image uploads
router.put('/products/:id', upload.array('images'), updateProduct);

// Route to fetch all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// Route to fetch a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Route to delete a product by ID
router.delete('/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting product with ID: ${id}`);
  
      const product = await Product.findByIdAndDelete(id);
  
      if (!product) {
        console.log('Product not found');
        return res.status(404).json({ error: 'Product not found' });
      }
  
      console.log('Product deleted successfully');
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error.stack);
      res.status(500).json({ error: 'Error deleting product' });
    }
});

module.exports = router;
