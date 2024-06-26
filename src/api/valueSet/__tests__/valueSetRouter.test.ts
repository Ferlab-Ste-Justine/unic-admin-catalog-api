import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockValueSet, mockValueSet } from '@/api/mocks';
import { valueSetService } from '@/api/valueSet/valueSetService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/valueSet/valueSetService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('ValueSet API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /value-sets', () => {
    it('should return a list of value sets', async () => {
      const valueSets = [mockValueSet];

      (valueSetService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value sets found', valueSets, StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(valueSets);
    });

    it('should return empty array when no value sets found', async () => {
      (valueSetService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No value sets found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should apply search filters', async () => {
      const valueSets = [mockValueSet];

      (valueSetService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value sets found', valueSets, StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets?searchField=name&searchValue=TestValueSet');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(valueSets);
    });

    it('should return empty array when no value sets match search filters', async () => {
      (valueSetService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No value sets found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets?searchField=name&searchValue=NonExistentValueSet');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should return value sets sorted by name in ascending order', async () => {
      const valueSets = [mockValueSet];

      (valueSetService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value sets found', valueSets, StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets?sortBy=name&sortOrder=asc');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(valueSets);
    });
  });

  describe('GET /value-sets/:id', () => {
    it('should return a single value set by id', async () => {
      (valueSetService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value set found', mockValueSet, StatusCodes.OK)
      );

      const response = await request(app).get('/value-sets/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockValueSet);
    });

    it('should return 404 for a non-existent value set by id', async () => {
      (valueSetService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/value-sets/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /value-sets', () => {
    const newValueSet = { ...mockValueSet, id: 2, name: 'New Value Set' };

    it('should create a new value set', async () => {
      (valueSetService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value set created', newValueSet, StatusCodes.OK)
      );

      const response = await request(app).post('/value-sets').send(newValueSet);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(newValueSet);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/value-sets').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/value-sets').send(invalidMockValueSet);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate value set creation', async () => {
      (valueSetService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set with name ${newValueSet.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/value-sets').send(newValueSet);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /value-sets/:id', () => {
    const updatedValueSet = { ...mockValueSet, name: 'Updated Value Set' };

    it('should update an existing value set', async () => {
      (valueSetService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value set updated', updatedValueSet, StatusCodes.OK)
      );

      const response = await request(app).put('/value-sets/1').send(updatedValueSet);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedValueSet);
    });

    it('should return 404 for updating a non-existent value set', async () => {
      (valueSetService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/value-sets/999').send(updatedValueSet);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/value-sets/1').send(invalidMockValueSet);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate value set update', async () => {
      (valueSetService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set with name ${mockValueSet.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/value-sets/1').send(mockValueSet);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /value-sets/:id', () => {
    it('should delete an existing value set', async () => {
      (valueSetService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Value set deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/value-sets/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent value set', async () => {
      (valueSetService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/value-sets/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
