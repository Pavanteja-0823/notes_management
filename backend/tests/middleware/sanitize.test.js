/**
 * Sanitize Middleware Tests
 * Tests: XSS protection and NoSQL injection prevention
 */
const httpMocks = require('node-mocks-http');
const { xssProtection, noSqlSanitizer, stripXSS } = require('../../middleware/sanitize');

describe('Sanitize Middleware', () => {
  describe('stripXSS', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(stripXSS(input)).not.toContain('<script>');
      expect(stripXSS(input)).toContain('Hello');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      expect(stripXSS(input)).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = '<div onload="alert(1)">Content</div>';
      expect(stripXSS(input)).not.toContain('onload=');
      expect(stripXSS(input)).toContain('Content');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="malicious.html"></iframe>Content';
      expect(stripXSS(input)).not.toContain('<iframe');
      expect(stripXSS(input)).toContain('Content');
    });

    it('should return non-string values unchanged', () => {
      expect(stripXSS(123)).toBe(123);
      expect(stripXSS(null)).toBe(null);
      expect(stripXSS(undefined)).toBe(undefined);
    });
  });

  describe('xssProtection', () => {
    it('should sanitize request body', () => {
      const req = httpMocks.createRequest({
        body: {
          title: 'Hello <script>alert(1)</script>',
          content: 'Safe content',
        },
      });
      const res = {};
      const next = jest.fn();

      xssProtection(req, res, next);

      expect(req.body.title).not.toContain('<script>');
      expect(req.body.title).toBe('Hello ');
      expect(req.body.content).toBe('Safe content');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize request query', () => {
      const req = httpMocks.createRequest({
        query: {
          search: '<script>malicious()</script>test',
        },
      });
      const res = {};
      const next = jest.fn();

      xssProtection(req, res, next);

      expect(req.query.search).not.toContain('<script>');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize request params', () => {
      const req = httpMocks.createRequest({
        params: {
          id: '<iframe src="bad"></iframe>123',
        },
      });
      const res = {};
      const next = jest.fn();

      xssProtection(req, res, next);

      expect(req.params.id).not.toContain('<iframe');
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing body/query/params gracefully', () => {
      const req = httpMocks.createRequest();
      const res = {};
      const next = jest.fn();

      expect(() => xssProtection(req, res, next)).not.toThrow();
      expect(next).toHaveBeenCalled();
    });
  });
});
