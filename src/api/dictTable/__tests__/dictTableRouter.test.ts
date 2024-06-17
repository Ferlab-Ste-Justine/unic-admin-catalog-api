import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockDictTable, mockDictTable } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { DictTable } from '../dictTableModel';
import { dictTableService } from '../dictTableService';

vi.mock('../dictTableService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('DictTable API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /dict-tables', () => {
    it('should return a list of dictTables', async () => {
      const dictTables: DictTable[] = [mockDictTable];

      (dictTableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', dictTables, StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(dictTables);
    });

    it('should return empty array when no dictTables found', async () => {
      (dictTableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No DictTables found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should apply search filters', async () => {
      const dictTables: DictTable[] = [mockDictTable];

      (dictTableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', dictTables, StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables?searchField=name&searchValue=DictTable 1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(dictTables);
    });

    it('should return empty array when no dictTables match search filters', async () => {
      (dictTableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No DictTables found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables?searchField=name&searchValue=NonExistentDictTable');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should return dictTables sorted by name in ascending order', async () => {
      const dictTables: DictTable[] = [mockDictTable];

      (dictTableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', dictTables, StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables?sortBy=name&sortOrder=asc');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(dictTables);
    });
  });

  describe('GET /dict-tables/:id', () => {
    it('should return a single dictTable by id', async () => {
      (dictTableService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'DictTable found', mockDictTable, StatusCodes.OK)
      );

      const response = await request(app).get('/dict-tables/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockDictTable);
    });

    it('should return 404 for a non-existent dictTable by id', async () => {
      (dictTableService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/dict-tables/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /dict-tables', () => {
    it('should create a new dictTable', async () => {
      (dictTableService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'DictTable created', mockDictTable, StatusCodes.OK)
      );

      const response = await request(app).post('/dict-tables').send(mockDictTable);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockDictTable);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/dict-tables').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/dict-tables').send(invalidMockDictTable);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate dictTable creation', async () => {
      (dictTableService.create as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An DictTable with name ${mockDictTable.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).post('/dict-tables').send(mockDictTable);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /dict-tables/:id', () => {
    const updatedDictTable: DictTable = { ...mockDictTable, to_be_published: false };

    it('should update an existing dictTable', async () => {
      (dictTableService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'DictTable updated', updatedDictTable, StatusCodes.OK)
      );

      const response = await request(app).put('/dict-tables/1').send(updatedDictTable);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedDictTable);
    });

    it('should return 404 for updating a non-existent dictTable', async () => {
      (dictTableService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).put('/dict-tables/999').send(mockDictTable);

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).put('/dict-tables/1').send({
        resource_id: '123',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate dictTable update', async () => {
      (dictTableService.update as Mock).mockResolvedValue(
        new ServiceResponse(
          ResponseStatus.Failed,
          `An DictTable with name ${mockDictTable.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );

      const response = await request(app).put('/dict-tables/1').send(mockDictTable);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /dict-tables/:id', () => {
    it('should delete an existing dictTable', async () => {
      (dictTableService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'DictTable deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/dict-tables/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent dictTable', async () => {
      (dictTableService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/dict-tables/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
