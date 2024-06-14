import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockVariable, mockVariable } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { Variable } from '../variableModel';
import { variableService } from '../variableService';

vi.mock('../variableService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Variable API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /variables', () => {
    it('should return a list of variables', async () => {
      const variables: Variable[] = [mockVariable];

      (variableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', [mockVariable], StatusCodes.OK)
      );

      const response = await request(app).get('/variables');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(variables);
    });

    it('should apply search filters', async () => {
      const variables: Variable[] = [mockVariable];

      (variableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', [mockVariable], StatusCodes.OK)
      );

      const response = await request(app).get('/variables?searchField=name&searchValue=Variable 1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(variables);
    });

    it('should return empty array when no variables match search filters', async () => {
      (variableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/variables?searchField=name&searchValue=NonExistentVariable');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });

    it('should return variables sorted by name in ascending order', async () => {
      const variables: Variable[] = [mockVariable];

      (variableService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', variables, StatusCodes.OK)
      );

      const response = await request(app).get('/variables?sortBy=name&sortOrder=asc');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(variables);
    });
  });

  describe('GET /variables/:id', () => {
    it('should return a single variable by id', async () => {
      (variableService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variable found', mockVariable, StatusCodes.OK)
      );

      const response = await request(app).get('/variables/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockVariable);
    });

    it('should return 404 for a non-existent variable by id', async () => {
      (variableService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/variables/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /variables', () => {
    it('should create a new variable', async () => {
      (variableService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variable created', mockVariable, StatusCodes.OK)
      );

      const response = await request(app).post('/variables').send(mockVariable);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockVariable);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/variables').send({
        path: '/myPath',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/variables').send(invalidMockVariable);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for duplicate variable creation', async () => {
      (variableService.create as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Variable already exists', null, StatusCodes.CONFLICT)
      );

      const response = await request(app).post('/variables').send(mockVariable);

      expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('PUT /variables/:id', () => {
    it('should update an existing variable', async () => {
      const updatedVariable: Variable = { ...mockVariable, name: 'Updated Variable' };

      (variableService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variable updated', updatedVariable, StatusCodes.OK)
      );

      const response = await request(app)
        .put('/variables/1')
        .send({ ...mockVariable, name: 'Updated Variable' });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(updatedVariable);
    });

    it('should return 404 for updating a non-existent variable', async () => {
      (variableService.update as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app)
        .put('/variables/999')
        .send({ ...mockVariable, name: 'Updated Variable' });

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('DELETE /variables/:id', () => {
    it('should delete an existing variable', async () => {
      (variableService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Variable deleted', null, StatusCodes.OK)
      );

      const response = await request(app).delete('/variables/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toBeNull();
    });

    it('should return 404 for deleting a non-existent variable', async () => {
      (variableService.delete as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).delete('/variables/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });
});
