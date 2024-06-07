import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { app } from '@/server';

import { generateOpenAPIDocument } from '../openAPIDocumentGenerator';

vi.mock('pg', () => {
  const mClient = {
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
  };
  const mPool = {
    connect: vi.fn(() => Promise.resolve(mClient)),
    query: vi.fn(() => Promise.resolve()),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mPool) }; // Exporting Pool
});

describe('OpenAPI Router', () => {
  describe('Swagger JSON route', () => {
    it('should return Swagger JSON content', async () => {
      // Arrange
      const expectedResponse = generateOpenAPIDocument();

      // Act
      const response = await request(app).get('/swagger.json');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual(expectedResponse);
    });

    it('should serve the Swagger UI', async () => {
      // Act
      const response = await request(app).get('/');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.text).toContain('swagger-ui');
    });
  });
});
