const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../productModel');

describe('Product API', () => {
    beforeAll(async () => {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';
        await mongoose.connect(mongoURI);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Product.deleteMany({});
    });

    describe('POST /api/products', () => {
        const validProduct = {
            name: 'Test Product',
            sku: 'TEST-123',
            price: 99.99,
            stock: 100,
            category: 'Electronics',
            description: 'Test description',
            weight: 1.5,
            dimensions: {
                length: 10,
                width: 5,
                height: 2
            },
            features: ['Feature 1', 'Feature 2'],
            images: ['image1.jpg', 'image2.jpg']
        };

        it('should create a new product with valid data', async () => {
            const res = await request(app)
                .post('/api/products')
                .send(validProduct);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(validProduct.name);
            expect(res.body.data.sku).toBe(validProduct.sku);
        });

        it('should fail to create product without required fields', async () => {
            const invalidProduct = {
                name: 'Test Product'
            };

            const res = await request(app)
                .post('/api/products')
                .send(invalidProduct);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('required');
        });

        it('should fail to create product with duplicate SKU', async () => {
            await Product.create(validProduct);

            const duplicateProduct = {
                ...validProduct,
                name: 'Another Product'
            };

            const res = await request(app)
                .post('/api/products')
                .send(duplicateProduct);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('SKU already exists');
        });

        it('should fail to create product with negative price', async () => {
            const invalidProduct = {
                ...validProduct,
                price: -10
            };

            const res = await request(app)
                .post('/api/products')
                .send(invalidProduct);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});