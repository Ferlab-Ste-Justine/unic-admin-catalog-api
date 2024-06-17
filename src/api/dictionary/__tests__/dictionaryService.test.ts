import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { Dictionary } from '@/api/dictionary/dictionaryModel';
import { validateResourceId } from '@/api/helpers';
import { mockDictionary } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import { dictionaryRepository } from '../dictionaryRepository';
import { dictionaryService } from '../dictionaryService';

vi.mock('../dictionaryRepository');

vi.mock('@/api/helpers', () => ({
  validateResourceId: vi.fn(),
}));

describe('dictionaryService', () => {
  beforeEach(() => {
    (validateResourceId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Resource ID is valid', null, StatusCodes.OK)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all dictionaries', async () => {
      (dictionaryRepository.findAll as Mock).mockResolvedValueOnce([mockDictionary]);

      const result = await dictionaryService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', [mockDictionary], StatusCodes.OK)
      );
    });

    it('should return no dictionaries if none found', async () => {
      (dictionaryRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await dictionaryService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No dictionaries found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (dictionaryRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictionaryService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all dictionaries: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findById', () => {
    it('should return a dictionary by id', async () => {
      (dictionaryRepository.findById as Mock).mockResolvedValueOnce(mockDictionary);

      const result = await dictionaryService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary found', mockDictionary, StatusCodes.OK)
      );
    });

    it('should return not found if dictionary is not found', async () => {
      (dictionaryRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await dictionaryService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (dictionaryRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictionaryService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding dictionary with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new dictionary', async () => {
      (dictionaryRepository.create as Mock).mockResolvedValueOnce(mockDictionary);

      const result = await dictionaryService.create(mockDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Dictionary created successfully',
          mockDictionary,
          StatusCodes.CREATED
        )
      );
    });

    it('should handle validation errors during create', async () => {
      (validateResourceId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid resource ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await dictionaryService.create(mockDictionary);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid resource ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during create', async () => {
      (dictionaryRepository.findByResourceId as Mock).mockResolvedValueOnce(mockDictionary);

      const result = await dictionaryService.create(mockDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dictionary with resource_id ${mockDictionary.resource_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (dictionaryRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictionaryService.create(mockDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating dictionary: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedDictionary: Dictionary = {
      ...mockDictionary,
      to_be_published: false,
    };

    it('should update an existing dictionary', async () => {
      (dictionaryRepository.update as Mock).mockResolvedValueOnce(updatedDictionary);

      const result = await dictionaryService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Dictionary updated successfully',
          updatedDictionary,
          StatusCodes.OK
        )
      );
    });

    it('should handle validation errors during update', async () => {
      (validateResourceId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid resource ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await dictionaryService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid resource ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors during update', async () => {
      (dictionaryRepository.findByResourceId as Mock).mockResolvedValueOnce({ ...updatedDictionary, id: 2 });

      const result = await dictionaryService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dictionary with resource_id ${updatedDictionary.resource_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if dictionary is not found for update', async () => {
      (dictionaryRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await dictionaryService.update(999, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (dictionaryRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictionaryService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating dictionary with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing dictionary', async () => {
      (dictionaryRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await dictionaryService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (dictionaryRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictionaryService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting dictionary with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
