import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';


describe('FreshMart Backend E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;
  let testAdminId: number;
  let testProductId: number;
  let testCategoryId: number;
  let testBannerId: number;
  let testOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Test Admin',
        phone: '+91 9876543210',
        role: 'ADMIN',
        isActive: true,
      },
    });
    testAdminId = admin.id;

    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: hashedPassword,
        name: 'Test User',
        phone: '+91 1234567890',
        role: 'USER',
        isActive: true,
      },
    });
    testUserId = user.id;

    adminToken = jwtService.sign({ userId: admin.id, email: admin.email, role: 'ADMIN' });
    userToken = jwtService.sign({ userId: user.id, email: user.email, role: 'USER' });
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET) - should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - should login admin successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'Test@123' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.user.role).toBe('ADMIN');
    });

    it('/auth/login (POST) - should login user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'Test@123' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('USER');
    });

    it('/auth/login (POST) - should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'WrongPassword' })
        .expect(401);
      expect(response.body.success).toBe(false);
    });

    it('/auth/register (POST) - should register new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'Test@123',
          phone: '+91 9999999999',
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@test.com');
    });
  });

  describe('Users Module (Admin Access)', () => {
    it('/users (GET) - should get all users (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('/users (GET) - should reject non-admin access', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
      expect(response.body.success).toBe(false);
    });

    it('/users/:id (GET) - should get user by id (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUserId);
    });

    it('/users/:id (PUT) - should update user (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated User', isActive: true })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated User');
    });

    it('/users/:id/block (PATCH) - should block/unblock user (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it('/users/profile (GET) - should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('user@test.com');
    });
  });

  describe('Categories Module', () => {
    it('/categories (POST) - should create category (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Category', isActive: true, priority: 1 })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Category');
      testCategoryId = response.body.data.id;
    });

    it('/categories (GET) - should get all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/categories/:id (GET) - should get category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCategoryId);
    });

    it('/categories/:id (PUT) - should update category (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Category', priority: 2 })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Category');
    });

    it('/categories/:id/subcategories (POST) - should create subcategory (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/categories/${testCategoryId}/subcategories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test SubCategory', priority: 1 })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test SubCategory');
    });
  });

  describe('Products Module', () => {
    it('/products (POST) - should create product (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          brand: 'Test Brand',
          variant: '500g',
          price: 100,
          mrp: 120,
          discount: 15,
          inStock: true,
          quantity: 50,
          subCategoryId: 1,
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Product');
      testProductId = response.body.data.id;
    });

    it('/products (GET) - should get all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('/products/:id (GET) - should get product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProductId);
    });

    it('/products/:id (PUT) - should update product (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 90, quantity: 100 })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(90);
    });

    it('/products/:id/stock (PATCH) - should update stock (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 75, inStock: true })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(75);
    });

    it('/products (GET) - should filter products by search', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?search=Test')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Banners Module', () => {
    it('/banners (POST) - should create banner (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl: 'https://example.com/banner.jpg',
          targetScreen: 'home',
          isActive: true,
          priority: 1,
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.imageUrl).toBe('https://example.com/banner.jpg');
      testBannerId = response.body.data.id;
    });

    it('/banners (GET) - should get all banners', async () => {
      const response = await request(app.getHttpServer())
        .get('/banners')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/banners/active (GET) - should get active banners', async () => {
      const response = await request(app.getHttpServer())
        .get('/banners/active')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/banners/:id (PUT) - should update banner (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priority: 2, isActive: false })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe(2);
    });

    it('/banners/:id/toggle-status (PATCH) - should toggle banner status (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/banners/${testBannerId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });

    it('/banners/:id/priority (PATCH) - should update banner priority (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/banners/${testBannerId}/priority`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priority: 5 })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe(5);
    });
  });

  describe('Cart Module', () => {
    it('/cart (GET) - should get empty cart for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
    });

    it('/cart/add (POST) - should add item to cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: testProductId, quantity: 2 })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('/cart/update (PUT) - should update cart item quantity', async () => {
      const response = await request(app.getHttpServer())
        .put('/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: testProductId, quantity: 3 })
        .expect(200);
      expect(response.body.success).toBe(true);
    });

    it('/cart/remove/:productId (DELETE) - should remove item from cart', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/cart/remove/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Orders Module', () => {
    it('/orders (POST) - should create order (User)', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUserId,
          name: 'Test User',
          phone: '+91 1234567890',
          street: '123 Test Street',
          city: 'Chennai',
          district: 'Chennai',
          state: 'Tamil Nadu',
          zip: '600001',
          country: 'India',
          isDefault: true,
        },
      });

      await prisma.cart.create({
        data: {
          userId: testUserId,
          items: {
            create: {
              productId: testProductId,
              quantity: 2,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 2 }],
          addressId: address.id,
          paymentMethod: 'COD',
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBeDefined();
      testOrderId = response.body.data.id;
    });

    it('/orders (GET) - should get user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/orders/:id (GET) - should get order by id (User)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrderId);
    });

    it('/orders/admin/all (GET) - should get all orders (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('/orders/admin/:id (GET) - should get order by id (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/admin/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrderId);
    });

    it('/orders/admin/:id/status (PATCH) - should update order status (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/admin/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CONFIRMED');
    });

    it('/orders/admin/stats/summary (GET) - should get order stats (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/admin/stats/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalOrders).toBeDefined();
      expect(response.body.data.pendingOrders).toBeDefined();
    });
  });

  describe('SubCategories Module', () => {
    it('/subcategories (GET) - should get all subcategories', async () => {
      const response = await request(app.getHttpServer())
        .get('/subcategories')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/subcategories (POST) - should create subcategory (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/subcategories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New SubCategory', categoryId: testCategoryId, isActive: true })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New SubCategory');
    });

    it('/subcategories/:id/status (PATCH) - should toggle subcategory status (Admin)', async () => {
      const subcategory = await prisma.subCategory.findFirst();
      if (subcategory) {
        const response = await request(app.getHttpServer())
          .patch(`/subcategories/${subcategory.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isActive: false })
          .expect(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Home Module', () => {
    it('/home/layout (GET) - should get home layout', async () => {
      const response = await request(app.getHttpServer())
        .get('/home/layout')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.banners).toBeDefined();
      expect(response.body.data.directory).toBeDefined();
    });
  });

  describe('Authorization Guards', () => {
    it('/users (GET) - should reject unauthenticated request', async () => {
      const response = await request(app.getHttpServer()).get('/users').expect(401);
      expect(response.body.success).toBe(false);
    });

    it('/products (POST) - should reject unauthenticated request', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test' })
        .expect(401);
      expect(response.body.success).toBe(false);
    });

    it('/orders/admin/all (GET) - should reject non-admin request', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('/products/:id (DELETE) - should delete product (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });

    it('/banners/:id (DELETE) - should delete banner (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });

    it('/categories/:id (DELETE) - should delete category (Admin)', async () => {
      await prisma.subCategory.deleteMany({ where: { categoryId: testCategoryId } });
      const response = await request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
  });
});