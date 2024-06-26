import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockValueSetCode, mockValueSetCode } from '@/api/mocks';
import { ValueSetCode } from '@/api/valueSetCode/valueSetCodeModel';
import { valueSetCodeService } from '@/api/valueSetCode/valueSetCodeService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/valueSetCode/valueSetCodeService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('ValueSetCode API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /value-set-codes', () => {
    it('should return a list of valueSetCodes', async () => {
      const valueSetCodes: ValueSetCode[] = [mockValueSetCode];

      (valueSetCodeService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'ValueSetCodes found', valueSetCodes, StatusCodes.OK)
      );

      const response = await request(app).get('/value-set-codes');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(valueSetCodes);
    });

    it('should return empty array when no valueSetCodes found', async () => {
      (valueSetCodeService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No valueSetCodes found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/value-set-codes');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });
  });

  describe('GET /value-set-codes/:id', () => {
    it('should return a single valueSetCode by id', async () => {
      (valueSetCodeService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'ValueSetCode found', mockValueSetCode, StatusCodes.OK)
      );

      const response = await request(app).get('/value-set-codes/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockValueSetCode);
    });

    it('should return 404 for a non-existent valueSetCode by id', async () => {
      (valueSetCodeService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'ValueSetCode not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/value-set-codes/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /value-set-codes', () => {
    it('should create a new valueSetCode', async () => {
      (valueSetCodeService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'ValueSetCode created', mockValueSetCode, StatusCodes.OK)
      );

      const response = await request(app).post('/value-set-codes').send(mockValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockValueSetCode);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/value-set-codes').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/value-set-codes').send(invalidMockValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate valueSetCode creation', async () => {
      (valueSetCodeService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An ValueSetCode with code ${mockValueSetCode.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/value-set-codes').send(mockValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /value-set-codes/:id', () => {
    const updatedValueSetCode: ValueSetCode = { ...mockValueSetCode, code: 'new code' };

    it('should update an existing valueSetCode', async () => {
      (valueSetCodeService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'ValueSetCode updated', updatedValueSetCode, StatusCodes.OK)
      );

      const response = await request(app).put('/value-set-codes/1').send(updatedValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedValueSetCode);
    });

    it('should return 404 for updating a non-existent valueSetCode', async () => {
      (valueSetCodeService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'ValueSetCode not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/value-set-codes/999').send(mockValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/value-set-codes/1').send({
        resource_id: '123',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate valueSetCode update', async () => {
      (valueSetCodeService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An ValueSetCode with code ${mockValueSetCode.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/value-set-codes/1').send(mockValueSetCode);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /value-set-codes/:id', () => {
    it('should delete an existing valueSetCode', async () => {
      (valueSetCodeService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'ValueSetCode deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/value-set-codes/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent valueSetCode', async () => {
      (valueSetCodeService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'ValueSetCode not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/value-set-codes/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
