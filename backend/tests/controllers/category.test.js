/**
 * Category Controller Tests
 * Tests: CRUD operations for categories
 */
const request = require('supertest');
const app = require('../../server');
const Category = require('../../models/Category');
const Note = require('../../models/Note');
const { createTestUser, authHeader } = require('../setup');

describe('Category Controller', () => {
  let user, token;

  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });

  describe('POST /api/categories', () => {
    it('should create a category with valid data', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({
          name: 'Work',
          color: '#3b82f6',
          description: 'Work related notes',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.name).toBe('Work');
      expect(res.body.data.category.color).toBe('#3b82f6');
    });

    it('should fail without name', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ color: '#3b82f6' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate name for same user (409 conflict)', async () => {
      await Category.create({ user: user._id, name: 'Work' });

      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ name: 'Work' });

      // Unique compound index on {user, name} causes MongoDB duplicate key error (409)
      expect(res.status).toBe(409);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories for the user', async () => {
      await Category.create([
        { user: user._id, name: 'Personal' },
        { user: user._id, name: 'Work' },
      ]);

      const res = await request(app)
        .get('/api/categories')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.categories.length).toBe(2);
    });

    it('should not return other users categories', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      await Category.create([
        { user: user._id, name: 'My Category' },
        { user: otherUser.user._id, name: 'Other Category' },
      ]);

      const res = await request(app)
        .get('/api/categories')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      const names = res.body.data.categories.map(c => c.name);
      expect(names).toContain('My Category');
      expect(names).not.toContain('Other Category');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const category = await Category.create({
        user: user._id,
        name: 'Old Name',
        color: '#6b7280',
      });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .set(authHeader(token))
        .send({ name: 'New Name', color: '#ef4444' });

      expect(res.status).toBe(200);
      expect(res.body.data.category.name).toBe('New Name');
      expect(res.body.data.category.color).toBe('#ef4444');
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .put(`/api/categories/${fakeId}`)
        .set(authHeader(token))
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category and update notes', async () => {
      const category = await Category.create({
        user: user._id,
        name: 'Delete Me',
      });

      // Create a note referencing this category
      await Note.create({
        user: user._id,
        title: 'Categorized Note',
        category: category._id,
      });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);

      // Verify notes have category set to null
      const notes = await Note.find({ user: user._id });
      notes.forEach(note => {
        expect(note.category).toBeNull();
      });

      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });
});
