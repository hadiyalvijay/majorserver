const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/productModel');

// Define the uploads directory path
const uploadsDir = path.join(__dirname, '../..', 'majorproject', 'uploads');

// Ensure the 'uploads' directory exists or create it
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
} else {
    console.log('Uploads directory already exists');
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save to 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filenames
    }
});

// Set up multer for image uploads
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },  // 20 MB max file size
});

// Controller to create a product
const createProduct = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);

        if (!req.files || req.files.length === 0) {
            console.log('No files uploaded');
            throw new Error('No files uploaded');
        }

        const {
            name,
            sku,
            price,
            stock,
            category,
            description,
            status,
            weight,
            dimensions,
            shippingClass,
            features,
        } = req.body;

        if (!name || !sku || !price || !stock || !category) {
            console.log('Missing required fields');
            throw new Error('Missing required fields');
        }

        const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
        console.log('Image URLs:', imageUrls);

        const product = new Product({
            name,
            sku,
            price,
            stock,
            category,
            description,
            status,
            weight,
            dimensions,
            shippingClass,
            features,
            images: imageUrls,
        });

        console.log('Product Data:', product);

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error.stack);
        res.status(500).json({ error: `Error creating product: ${error.message}` });
    }
};

// Controller to update a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Updating product with ID: ${id}`);

        const {
            name,
            sku,
            price,
            stock,
            category,
            description,
            status,
            weight,
            dimensions,
            shippingClass,
            features,
        } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        if (name) product.name = name;
        if (sku) product.sku = sku;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category;
        if (description) product.description = description;
        if (status) product.status = status;
        if (weight) product.weight = weight;
        if (dimensions) product.dimensions = dimensions;
        if (shippingClass) product.shippingClass = shippingClass;
        if (features) product.features = features;

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            product.images = newImageUrls;  // Update images if new ones are uploaded
        }

        console.log('Updated Product Data:', product);

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error.stack);
        res.status(500).json({ error: `Error updating product: ${error.message}` });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    upload,
};
