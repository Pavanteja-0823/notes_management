/**
 * Note Controller Tests
 * Tests: CRUD operations, pin, favorite, archive, trash, restore, tags
 */
const request = require('supertest');
const app = require('../../server');
const Note = require('../../models/Note');
const Category = require('../../models/Category');
const { createTestUser, authHeader } = require('../setup');

describe('Note Controller', () => {
  let user, token, category;

  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;

    category = await Category.create({
      user: user._id,
      name: 'Test Category',
      color: '#3b82f6',
    });
  });

  describe('POST /api/notes', () => {
    it('should create a note with valid data', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set(authHeader(token))
        .send({
          title: 'Test Note',
          content: 'This is a test note content',
          color: '#fbbc04',
          tags: ['test', 'demo'],
          category: category._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.title).toBe('Test Note');
      expect(res.body.data.note.content).toBe('This is a test note content');
      expect(res.body.data.note.tags).toContain('test');
      expect(res.body.data.note.category._id).toBe(category._id.toString());
    });

    it('should create a note with default values for empty title', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set(authHeader(token))
        .send({
          content: 'Just content',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.note.title).toBe('Untitled');
      expect(res.body.data.note.color).toBe('#ffffff');
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notes', () => {
    beforeEach(async () => {
      await Note.create([
        { user: user._id, title: 'Note 1', content: 'First note', tags: ['work'] },
        { user: user._id, title: 'Note 2', content: 'Second note', tags: ['personal'], isPinned: true },
        { user: user._id, title: 'Note 3', content: 'Third note', isArchived: true },
        { user: user._id, title: 'Note 4', content: 'Fourth note', isFavorite: true },
      ]);
    });

    it('should return all non-archived, non-trashed notes by default', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(3); // 4 minus the archived one
    });

    it('should filter by favorite', async () => {
      const res = await request(app)
        .get('/api/notes?isFavorite=true')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.notes[0].title).toBe('Note 4');
    });

    it('should filter by archive', async () => {
      const res = await request(app)
        .get('/api/notes?isArchived=true')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.notes[0].title).toBe('Note 3');
    });

    it('should search by title', async () => {
      const res = await request(app)
        .get('/api/notes?search=First')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBeGreaterThanOrEqual(1);
    });

    it('should search by content', async () => {
      const res = await request(app)
        .get('/api/notes?search=Second')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBeGreaterThanOrEqual(1);
    });

    it('should sort by title ascending', async () => {
      const res = await request(app)
        .get('/api/notes?sortBy=title&sortOrder=asc')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes[0].title).toBe('Note 1');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/notes?page=1&limit=2')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return a single note by ID', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Single Note',
        content: 'Content',
      });

      const res = await request(app)
        .get(`/api/notes/${note._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.note.title).toBe('Single Note');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .get(`/api/notes/${fakeId}`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Original Title',
        content: 'Original content',
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}`)
        .set(authHeader(token))
        .send({
          title: 'Updated Title',
          content: 'Updated content',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.note.title).toBe('Updated Title');
      expect(res.body.data.note.content).toBe('Updated content');
    });

    it('should update tags', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Tag Test',
        tags: ['old'],
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}`)
        .set(authHeader(token))
        .send({ tags: ['new', 'updated'] });

      expect(res.status).toBe(200);
      expect(res.body.data.note.tags).toContain('new');
      expect(res.body.data.note.tags).toContain('updated');
      expect(res.body.data.note.tags).not.toContain('old');
    });
  });

  describe('PUT /api/notes/:id/pin', () => {
    it('should toggle pin status', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Pin Test',
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}/pin`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.note.isPinned).toBe(true);

      // Toggle back
      const res2 = await request(app)
        .put(`/api/notes/${note._id}/pin`)
        .set(authHeader(token));

      expect(res2.status).toBe(200);
      expect(res2.body.data.note.isPinned).toBe(false);
    });
  });

  describe('PUT /api/notes/:id/favorite', () => {
    it('should toggle favorite status', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Fav Test',
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}/favorite`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.note.isFavorite).toBe(true);
    });
  });

  describe('PUT /api/notes/:id/trash and restore', () => {
    it('should move note to trash', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Trash Test',
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}/trash`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.note.isTrashed).toBe(true);
    });

    it('should restore trashed note', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Restore Test',
        isTrashed: true,
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}/restore`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.note.isTrashed).toBe(false);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should permanently delete a note', async () => {
      const note = await Note.create({
        user: user._id,
        title: 'Delete Test',
      });

      const res = await request(app)
        .delete(`/api/notes/${note._id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedNote = await Note.findById(note._id);
      expect(deletedNote).toBeNull();
    });
  });

  describe('GET /api/notes/tags', () => {
    it('should return all tags with counts', async () => {
      await Note.create([
        { user: user._id, title: 'N1', tags: ['work', 'urgent'] },
        { user: user._id, title: 'N2', tags: ['work', 'personal'] },
        { user: user._id, title: 'N3', tags: ['personal'] },
      ]);

      const res = await request(app)
        .get('/api/notes/tags')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toBeDefined();
      const workTag = res.body.data.tags.find(t => t.name === 'work');
      expect(workTag.count).toBe(2);
    });
  });
});
