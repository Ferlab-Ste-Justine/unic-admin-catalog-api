import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { dictTableRepository } from '@/api/dictTable/dictTableRepository';
import { dictTableService } from '@/api/dictTable/dictTableService';
import { validateDictionaryId } from '@/api/helpers';
import { mockDictTable } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/dictTable/dictTableRepository');

vi.mock('@/api/helpers', () => ({
  validateDictionaryId: vi.fn(),
}));

describe('dictTableService', () => {
  beforeEach(() => {
    (validateDictionaryId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Dictionary ID is valid', null, StatusCodes.OK)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all dictTables', async () => {
      (dictTableRepository.findAll as Mock).mockResolvedValueOnce([mockDictTable]);

      const result = await dictTableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'DictTables found', [mockDictTable], StatusCodes.OK)
      );
    });

    it('should return no dictTables if none found', async () => {
      (dictTableRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await dictTableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No DictTables found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (dictTableRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictTableService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all dictTables: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });

    it('should handle search and sort options', async () => {
      (dictTableRepository.findAll as Mock).mockResolvedValueOnce([mockDictTable]);

      const result = await dictTableService.findAll('name', 'Dict Table 1', 'name', 'asc');

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'DictTables found', [mockDictTable], StatusCodes.OK)
      );
    });
  });

  describe('findById', () => {
    it('should return a dictTable by id', async () => {
      (dictTableRepository.findById as Mock).mockResolvedValueOnce(mockDictTable);

      const result = await dictTableService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'DictTable found', mockDictTable, StatusCodes.OK)
      );
    });

    it('should return not found if dictTable is not found', async () => {
      (dictTableRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await dictTableService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (dictTableRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictTableService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding dictTable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new dictTable', async () => {
      (dictTableRepository.create as Mock).mockResolvedValueOnce(mockDictTable);

      const result = await dictTableService.create(mockDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'DictTable created successfully',
          mockDictTable,
          StatusCodes.CREATED
        )
      );
    });

    it('should handle validation errors during create', async () => {
      (validateDictionaryId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid dictionary ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await dictTableService.create(mockDictTable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid dictionary ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for dictionary_id during create', async () => {
      (dictTableRepository.findByDictionaryId as Mock).mockResolvedValueOnce(mockDictTable);

      const result = await dictTableService.create(mockDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dict Table with dictionary_id ${mockDictTable.dictionary_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for name during create', async () => {
      (dictTableRepository.findByName as Mock).mockResolvedValueOnce(mockDictTable);

      const result = await dictTableService.create(mockDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dict Table with name ${mockDictTable.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (dictTableRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictTableService.create(mockDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating dictTable: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedDictTable = {
      ...mockDictTable,
      to_be_published: false,
    };

    it('should update an existing dictTable', async () => {
      (dictTableRepository.update as Mock).mockResolvedValueOnce(updatedDictTable);

      const result = await dictTableService.update(1, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'DictTable updated successfully', updatedDictTable, StatusCodes.OK)
      );
    });

    it('should handle validation errors during update', async () => {
      (validateDictionaryId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid dictionary ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await dictTableService.update(1, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid dictionary ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for dictionary_id during update', async () => {
      (dictTableRepository.findByDictionaryId as Mock).mockResolvedValueOnce({ ...mockDictTable, id: 2 });

      const result = await dictTableService.update(1, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dict Table with dictionary_id ${updatedDictTable.dictionary_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for name during update', async () => {
      (dictTableRepository.findByName as Mock).mockResolvedValueOnce({ ...mockDictTable, id: 2 });

      const result = await dictTableService.update(1, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Dict Table with name ${updatedDictTable.name} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if dictTable is not found for update', async () => {
      (dictTableRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await dictTableService.update(999, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (dictTableRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictTableService.update(1, updatedDictTable);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating dictTable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing dictTable', async () => {
      (dictTableRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await dictTableService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'DictTable deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (dictTableRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await dictTableService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting dictTable with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
