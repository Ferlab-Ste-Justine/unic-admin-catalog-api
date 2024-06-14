import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { validateDictTableId, validateValueSetId } from '@/api/helpers';
import { mockVariable } from '@/api/mocks';
import { Variable } from '@/api/variable/variableModel';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import { variableRepository } from '../variableRepository';
import { variableService } from '../variableService';

vi.mock('../variableRepository');
vi.mock('@/api/helpers', () => ({
  validateValueSetId: vi.fn(),
  validateDictTableId: vi.fn(),
}));

describe('variableService', () => {
  beforeEach(() => {
    (validateValueSetId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Analyst ID is valid', null, StatusCodes.OK)
    );
    (validateDictTableId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Dict Table ID is valid', null, StatusCodes.OK)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all variables', async () => {
      (variableRepository.findAll as Mock).mockResolvedValueOnce([mockVariable]);

      const result = await variableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', [mockVariable], StatusCodes.OK)
      );
    });

    it('should return no variables if none found', async () => {
      (variableRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await variableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No Variables found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (variableRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await variableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all variables: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });

    it('should handle search and sort options', async () => {
      (variableRepository.findAll as Mock).mockResolvedValueOnce([mockVariable]);

      const result = await variableService.findAll('name', 'Variable 1', 'path', 'asc');

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variables found', [mockVariable], StatusCodes.OK)
      );
    });
  });

  describe('findById', () => {
    it('should return a variable by id', async () => {
      (variableRepository.findById as Mock).mockResolvedValueOnce(mockVariable);

      const result = await variableService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variable found', mockVariable, StatusCodes.OK)
      );
    });

    it('should return not found if variable is not found', async () => {
      (variableRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await variableService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (variableRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await variableService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding variable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new variable', async () => {
      (variableRepository.create as Mock).mockResolvedValueOnce(mockVariable);

      const result = await variableService.create(mockVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variable created successfully', mockVariable, StatusCodes.CREATED)
      );
    });

    it('should handle Dict Table ID validation errors during create', async () => {
      (validateDictTableId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Dict Table ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await variableService.create(mockVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Dict Table ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle Value Set ID validation errors during create', async () => {
      (validateValueSetId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await variableService.create(mockVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during create', async () => {
      (variableRepository.findByPath as Mock).mockResolvedValueOnce(mockVariable);

      const result = await variableService.create(mockVariable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Variable with path ${mockVariable.path} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (variableRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await variableService.create(mockVariable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating variable: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedVariable: Variable = {
      ...mockVariable,
      name: 'Updated Variable',
    };

    it('should update an existing variable', async () => {
      (variableRepository.update as Mock).mockResolvedValueOnce(updatedVariable);

      const result = await variableService.update(1, updatedVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variable updated successfully', updatedVariable, StatusCodes.OK)
      );
    });

    it('should handle Dict Table ID validation errors during update', async () => {
      (validateValueSetId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Dict Table ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await variableService.update(1, updatedVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Dict Table ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle Value Set ID validation errors during update', async () => {
      (validateValueSetId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await variableService.update(1, updatedVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during update', async () => {
      (variableRepository.findByPath as Mock).mockResolvedValueOnce({ ...mockVariable, id: 2 });

      const result = await variableService.update(1, { ...updatedVariable, path: mockVariable.path });

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Variable with path ${mockVariable.path} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if variable is not found for update', async () => {
      (variableRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await variableService.update(999, updatedVariable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (variableRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await variableService.update(1, updatedVariable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating variable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing variable', async () => {
      (variableRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await variableService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Variable deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (variableRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await variableService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting variable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
