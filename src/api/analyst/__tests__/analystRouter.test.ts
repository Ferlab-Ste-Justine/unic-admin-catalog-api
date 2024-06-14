import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockAnalyst, mockAnalyst } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { Analyst } from '../analystModel';
import { analystService } from '../analystService';

vi.mock('../analystService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Analyst API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /analysts', () => {
    it('should return a list of analysts', async () => {
      const analysts: Analyst[] = [mockAnalyst];

      (analystService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analysts found', analysts, StatusCodes.OK)
      );

      const response = await request(app).get('/analysts');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(analysts);
    });

    it('should return empty array when no analysts found', async () => {
      (analystService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No analysts found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/analysts');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should apply search filters', async () => {
      const analysts: Analyst[] = [mockAnalyst];

      (analystService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analysts found', analysts, StatusCodes.OK)
      );

      const response = await request(app).get('/analysts?searchField=name&searchValue=Analyst 1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(analysts);
    });

    it('should return empty array when no analysts match search filters', async () => {
      (analystService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No analysts found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/analysts?searchField=name&searchValue=NonExistentAnalyst');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should return analysts sorted by name in ascending order', async () => {
      const analysts: Analyst[] = [mockAnalyst];

      (analystService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analysts found', analysts, StatusCodes.OK)
      );

      const response = await request(app).get('/analysts?sortBy=name&sortOrder=asc');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(analysts);
    });
  });

  describe('GET /analysts/:id', () => {
    it('should return a single analyst by id', async () => {
      (analystService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analyst found', mockAnalyst, StatusCodes.OK)
      );

      const response = await request(app).get('/analysts/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockAnalyst);
    });

    it('should return 404 for a non-existent analyst by id', async () => {
      (analystService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/analysts/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /analysts', () => {
    it('should create a new analyst', async () => {
      (analystService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analyst created', mockAnalyst, StatusCodes.OK)
      );

      const response = await request(app).post('/analysts').send({
        name: 'New Analyst',
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockAnalyst);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/analysts').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/analysts').send(invalidMockAnalyst);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate analyst creation', async () => {
      (analystService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Analyst with name ${mockAnalyst.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/analysts').send({
        name: 'Analyst 1',
      });

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /analysts/:id', () => {
    it('should update an existing analyst', async () => {
      const updatedAnalyst: Analyst = { ...mockAnalyst, name: 'Updated Analyst' };

      (analystService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analyst updated', updatedAnalyst, StatusCodes.OK)
      );

      const response = await request(app).put('/analysts/1').send({ name: 'Updated Analyst' });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedAnalyst);
    });

    it('should return 404 for updating a non-existent analyst', async () => {
      (analystService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/analysts/999').send({ name: 'Updated Analyst' });

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/analysts/1').send({
        name: 123, // Invalid data type
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate analyst update', async () => {
      (analystService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An Analyst with name ${mockAnalyst.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/analysts/1').send({ name: 'Analyst 1' });

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /analysts/:id', () => {
    it('should delete an existing analyst', async () => {
      (analystService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Analyst deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/analysts/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent analyst', async () => {
      (analystService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/analysts/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
