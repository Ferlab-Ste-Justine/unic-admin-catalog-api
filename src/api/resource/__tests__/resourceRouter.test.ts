import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockResource, mockResource } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { Resource } from '../resourceModel';
import { resourceService } from '../resourceService';

vi.mock('../resourceService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Resource API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /resources', () => {
    it('should return a list of resources', async () => {
      const resources: Resource[] = [mockResource];

      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [mockResource], StatusCodes.OK)
      );

      const response = await request(app).get('/resources');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resources);
    });

    it('should apply search filters', async () => {
      const resources: Resource[] = [mockResource];

      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [mockResource], StatusCodes.OK)
      );

      const response = await request(app).get('/resources?searchField=name&searchValue=Resource 1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resources);
    });

    it('should return empty array when no resources match search filters', async () => {
      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/resources?searchField=name&searchValue=NonExistentResource');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should return resources sorted by name in ascending order', async () => {
      const resources: Resource[] = [mockResource];

      (resourceService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resources found', resources, StatusCodes.OK)
      );

      const response = await request(app).get('/resources?sortBy=name&sortOrder=asc');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(resources);
    });
  });

  describe('GET /resources/:id', () => {
    it('should return a single resource by id', async () => {
      (resourceService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource found', mockResource, StatusCodes.OK)
      );

      const response = await request(app).get('/resources/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockResource);
    });

    it('should return 404 for a non-existent resource by id', async () => {
      (resourceService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/resources/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /resources', () => {
    it('should create a new resource', async () => {
      (resourceService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource created', mockResource, StatusCodes.OK)
      );

      const response = await request(app).post('/resources').send(mockResource);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockResource);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/resources').send({
        code: 'NR',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/resources').send(invalidMockResource);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate resource creation', async () => {
      (resourceService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Resource already exists', null, StatusCodes.CONFLICT)
      );

      const response = await request(app).post('/resources').send(mockResource);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /resources/:id', () => {
    it('should update an existing resource', async () => {
      const updatedResource: Resource = { ...mockResource, name: 'Updated Resource' };

      (resourceService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource updated', updatedResource, StatusCodes.OK)
      );

      const response = await request(app)
        .put('/resources/1')
        .send({ ...mockResource, name: 'Updated Resource' });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedResource);
    });

    it('should return 404 for updating a non-existent resource', async () => {
      (resourceService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app)
        .put('/resources/999')
        .send({ ...mockResource, name: 'Updated Resource' });

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /resources/:id', () => {
    it('should delete an existing resource', async () => {
      (resourceService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Resource deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/resources/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent resource', async () => {
      (resourceService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Resource not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/resources/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
