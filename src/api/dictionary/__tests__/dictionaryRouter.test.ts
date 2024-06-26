import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { Dictionary } from '@/api/dictionary/dictionaryModel';
import { dictionaryService } from '@/api/dictionary/dictionaryService';
import { invalidMockDictionary, mockDictionary } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/dictionary/dictionaryService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Dictionary API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /dictionaries', () => {
    it('should return a list of dictionaries', async () => {
      const dictionaries: Dictionary[] = [mockDictionary];

      (dictionaryService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', dictionaries, StatusCodes.OK)
      );

      const response = await request(app).get('/dictionaries');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(dictionaries);
    });

    it('should return empty array when no dictionaries found', async () => {
      (dictionaryService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No dictionaries found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/dictionaries');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });
  });

  describe('GET /dictionaries/:id', () => {
    it('should return a single dictionary by id', async () => {
      (dictionaryService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary found', mockDictionary, StatusCodes.OK)
      );

      const response = await request(app).get('/dictionaries/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockDictionary);
    });

    it('should return 404 for a non-existent dictionary by id', async () => {
      (dictionaryService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/dictionaries/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /dictionaries', () => {
    it('should create a new dictionary', async () => {
      (dictionaryService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary created', mockDictionary, StatusCodes.OK)
      );

      const response = await request(app).post('/dictionaries').send(mockDictionary);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockDictionary);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/dictionaries').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/dictionaries').send(invalidMockDictionary);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate dictionary creation', async () => {
      (dictionaryService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Dictionary with resource_id ${mockDictionary.resource_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/dictionaries').send(mockDictionary);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /dictionaries/:id', () => {
    const updatedDictionary: Dictionary = { ...mockDictionary, to_be_published: false };

    it('should update an existing dictionary', async () => {
      (dictionaryService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary updated', updatedDictionary, StatusCodes.OK)
      );

      const response = await request(app).put('/dictionaries/1').send(updatedDictionary);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedDictionary);
    });

    it('should return 404 for updating a non-existent dictionary', async () => {
      (dictionaryService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/dictionaries/999').send(mockDictionary);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/dictionaries/1').send({
        resource_id: '123',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate dictionary update', async () => {
      (dictionaryService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Dictionary with resource_id ${mockDictionary.resource_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/dictionaries/1').send(mockDictionary);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /dictionaries/:id', () => {
    it('should delete an existing dictionary', async () => {
      (dictionaryService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/dictionaries/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent dictionary', async () => {
      (dictionaryService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/dictionaries/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
