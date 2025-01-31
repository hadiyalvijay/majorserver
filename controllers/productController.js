const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/productModel');

// Define the uploads directory paths for both majoradmin and majorproject
const adminUploadsDir = path.join(__dirname, '../..', 'majoradmin', 'uploads');
const projectUploadsDir = path.join(__dirname, '../..', 'majorproject', 'uploads');

// Ensure both 'uploads' directories exist or create them
[adminUploadsDir, projectUploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created uploads directory: ${dir}`);
    } else {
        console.log(`Uploads directory already exists: ${dir}`);
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, projectUploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        console.log('Uploaded file:', file.originalname, 'MIME Type:', file.mimetype);

        // Allowed file extensions
        const allowedExtensions = /\.(jpg|jpeg|png|gif|avif)$/i;

        // Allowed MIME types (ensures only actual image files are uploaded)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];

        if (!allowedExtensions.test(file.originalname) || !allowedMimeTypes.includes(file.mimetype)) {
            console.error('File type not allowed:', file.mimetype);
            return cb(new Error('Only image files (JPG, JPEG, PNG, GIF, AVIF) are allowed!'), false);
        }
        cb(null, true);
    }
});



// Middleware to copy files to admin directory
const copyToAdmin = (req, res, next) => {
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const sourceFile = path.join(projectUploadsDir, file.filename);
            const targetFile = path.join(adminUploadsDir, file.filename);
            
            fs.copyFile(sourceFile, targetFile, (err) => {
                if (err) console.error('Error copying to admin uploads:', err);
            });
        });
    }
    next();
};

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
            // Delete old images if they exist
            if (product.images && product.images.length > 0) {
                product.images.forEach(imagePath => {
                    const filename = path.basename(imagePath);
                    
                    // Delete from both directories
                    const adminPath = path.join(adminUploadsDir, filename);
                    const projectPath = path.join(projectUploadsDir, filename);
                    
                    if (fs.existsSync(adminPath)) {
                        fs.unlinkSync(adminPath);
                    }
                    if (fs.existsSync(projectPath)) {
                        fs.unlinkSync(projectPath);
                    }
                });
            }

            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            product.images = newImageUrls;
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
    copyToAdmin  // Export the middleware
};