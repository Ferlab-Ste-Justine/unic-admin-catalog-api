import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, Mock, vi } from 'vitest';

import { mockValueSet } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { valueSetRepository } from '../valueSetRepository';
import { valueSetService } from '../valueSetService';

vi.mock('../valueSetRepository');
vi.mock('@/server', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('valueSetService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all value sets', async () => {
      (valueSetRepository.findAll as Mock).mockResolvedValueOnce([mockValueSet]);

      const result = await valueSetService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value sets found', [mockValueSet], StatusCodes.OK)
      );
    });

    it('should return no value sets if none found', async () => {
      (valueSetRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await valueSetService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No value sets found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (valueSetRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all value sets: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
      expect(logger.error).toHaveBeenCalledWith('Error finding all value sets: Database connection error');
    });

    it('should handle search and sort options', async () => {
      (valueSetRepository.findAll as Mock).mockResolvedValueOnce([mockValueSet]);

      const result = await valueSetService.findAll('name', 'Value Set 1', 'name', 'asc');

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value sets found', [mockValueSet], StatusCodes.OK)
      );
    });
  });

  describe('findById', () => {
    it('should return a value set by id', async () => {
      (valueSetRepository.findById as Mock).mockResolvedValueOnce(mockValueSet);

      const result = await valueSetService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value set found', mockValueSet, StatusCodes.OK)
      );
    });

    it('should return not found if value set is not found', async () => {
      (valueSetRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await valueSetService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (valueSetRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding value set with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
      expect(logger.error).toHaveBeenCalledWith('Error finding value set with id 1: Database connection error');
    });
  });

  describe('create', () => {
    const newValueSet = {
      ...mockValueSet,
      name: 'New Value Set',
    };

    it('should create a new value set', async () => {
      (valueSetRepository.create as Mock).mockResolvedValueOnce(newValueSet);

      const result = await valueSetService.create(newValueSet);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value set created successfully', newValueSet, StatusCodes.CREATED)
      );
    });

    it('should handle uniqueness check errors during create', async () => {
      (valueSetRepository.findByName as Mock).mockResolvedValueOnce(newValueSet);

      const result = await valueSetService.create(newValueSet);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set with name ${newValueSet.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (valueSetRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetService.create(newValueSet);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating value set: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
      expect(logger.error).toHaveBeenCalledWith('Error creating value set: Database connection error');
    });
  });

  describe('update', () => {
    const updatedValueSet = {
      ...mockValueSet,
      name: 'Updated Value Set',
    };

    it('should update an existing value set', async () => {
      (valueSetRepository.update as Mock).mockResolvedValueOnce(updatedValueSet);

      const result = await valueSetService.update(1, updatedValueSet);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value set updated successfully', updatedValueSet, StatusCodes.OK)
      );
    });

    it('should handle uniqueness check errors during update', async () => {
      (valueSetRepository.findByName as Mock).mockResolvedValueOnce({ ...updatedValueSet, id: 2 });

      const result = await valueSetService.update(1, updatedValueSet);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set with name ${updatedValueSet.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if value set is not found for update', async () => {
      (valueSetRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await valueSetService.update(999, updatedValueSet);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (valueSetRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetService.update(1, updatedValueSet);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating value set with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
      expect(logger.error).toHaveBeenCalledWith('Error updating value set with id 1: Database connection error');
    });
  });

  describe('delete', () => {
    it('should delete an existing value set', async () => {
      (valueSetRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await valueSetService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value set deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (valueSetRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting value set with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
      expect(logger.error).toHaveBeenCalledWith('Error deleting value set with id 1: Database connection error');
    });
  });
});
