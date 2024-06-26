import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { Mapping } from '@/api/mapping/mappingModel';
import { mappingService } from '@/api/mapping/mappingService';
import { invalidMockMapping, mockMapping } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/mapping/mappingService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Mapping API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /mappings', () => {
    it('should return a list of mappings', async () => {
      const mappings: Mapping[] = [mockMapping];

      (mappingService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Mappings found', mappings, StatusCodes.OK)
      );

      const response = await request(app).get('/mappings');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mappings);
    });

    it('should return empty array when no mappings found', async () => {
      (mappingService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No mappings found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/mappings');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });
  });

  describe('GET /mappings/:id', () => {
    it('should return a single mapping by id', async () => {
      (mappingService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Mapping found', mockMapping, StatusCodes.OK)
      );

      const response = await request(app).get('/mappings/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockMapping);
    });

    it('should return 404 for a non-existent mapping by id', async () => {
      (mappingService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/mappings/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /mappings', () => {
    it('should create a new mapping', async () => {
      (mappingService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Mapping created', mockMapping, StatusCodes.OK)
      );

      const response = await request(app).post('/mappings').send(mockMapping);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockMapping);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/mappings').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/mappings').send(invalidMockMapping);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate mapping creation', async () => {
      (mappingService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Mapping with original_value ${mockMapping.original_value} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/mappings').send(mockMapping);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /mappings/:id', () => {
    const updatedMapping: Mapping = { ...mockMapping, original_value: 'updated_value' };

    it('should update an existing mapping', async () => {
      (mappingService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Mapping updated', updatedMapping, StatusCodes.OK)
      );

      const response = await request(app).put('/mappings/1').send(updatedMapping);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedMapping);
    });

    it('should return 404 for updating a non-existent mapping', async () => {
      (mappingService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/mappings/999').send(mockMapping);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/mappings/1').send({
        resource_id: '123',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate mapping update', async () => {
      (mappingService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Mapping with original_value ${mockMapping.original_value} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/mappings/1').send(mockMapping);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /mappings/:id', () => {
    it('should delete an existing mapping', async () => {
      (mappingService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Mapping deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/mappings/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent mapping', async () => {
      (mappingService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/mappings/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
