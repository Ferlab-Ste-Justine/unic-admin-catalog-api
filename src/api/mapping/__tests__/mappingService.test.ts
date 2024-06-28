import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { validateValueSetCodeId } from '@/api/helpers';
import { Mapping } from '@/api/mapping/mappingModel';
import { mappingRepository } from '@/api/mapping/mappingRepository';
import { mappingService } from '@/api/mapping/mappingService';
import { mockMapping } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/mapping/mappingRepository');

vi.mock('@/api/helpers', () => ({
  validateValueSetCodeId: vi.fn(),
}));

describe('mappingService', () => {
  beforeEach(() => {
    (validateValueSetCodeId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Value Set Code ID is valid', null, StatusCodes.OK)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all mappings', async () => {
      (mappingRepository.findAll as Mock).mockResolvedValueOnce([mockMapping]);

      const result = await mappingService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Mappings found', [mockMapping], StatusCodes.OK)
      );
    });

    it('should return no mappings if none found', async () => {
      (mappingRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await mappingService.findAll();

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'No Mappings found', [], StatusCodes.OK));
    });

    it('should handle errors during findAll', async () => {
      (mappingRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await mappingService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all mappings: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findById', () => {
    it('should return a mapping by id', async () => {
      (mappingRepository.findById as Mock).mockResolvedValueOnce(mockMapping);

      const result = await mappingService.findById(1);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Mapping found', mockMapping, StatusCodes.OK));
    });

    it('should return not found if mapping is not found', async () => {
      (mappingRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await mappingService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (mappingRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await mappingService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding mapping with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new mapping', async () => {
      (mappingRepository.create as Mock).mockResolvedValueOnce(mockMapping);

      const result = await mappingService.create(mockMapping);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Mapping created successfully', mockMapping, StatusCodes.CREATED)
      );
    });

    it('should handle validation errors during create', async () => {
      (validateValueSetCodeId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set Code ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await mappingService.create(mockMapping);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set Code ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for value_set_code_id during create', async () => {
      (mappingRepository.findByValueSetCodeId as Mock).mockResolvedValueOnce({ ...mockMapping, id: 2 });

      const result = await mappingService.create(mockMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Mapping with value_set_code_id ${mockMapping.value_set_code_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for original_value during create', async () => {
      (mappingRepository.findByOriginalValue as Mock).mockResolvedValueOnce({ ...mockMapping, id: 2 });

      const result = await mappingService.create(mockMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Mapping with original_value ${mockMapping.original_value} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (mappingRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await mappingService.create(mockMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating mapping: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedMapping: Mapping = {
      ...mockMapping,
      original_value: 'updated value',
    };

    it('should update an existing mapping', async () => {
      (mappingRepository.update as Mock).mockResolvedValueOnce(updatedMapping);

      const result = await mappingService.update(1, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Mapping updated successfully', updatedMapping, StatusCodes.OK)
      );
    });

    it('should handle validation errors during update', async () => {
      (validateValueSetCodeId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set Code ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await mappingService.update(1, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid Value Set Code ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for value_set_code_id during update', async () => {
      (mappingRepository.findByValueSetCodeId as Mock).mockResolvedValueOnce({ ...updatedMapping, id: 2 });

      const result = await mappingService.update(1, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Mapping with value_set_code_id ${updatedMapping.value_set_code_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for original_value during update', async () => {
      (mappingRepository.findByOriginalValue as Mock).mockResolvedValueOnce({ ...updatedMapping, id: 2 });

      const result = await mappingService.update(1, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Mapping with original_value ${updatedMapping.original_value} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if mapping is not found for update', async () => {
      (mappingRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await mappingService.update(999, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (mappingRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await mappingService.update(1, updatedMapping);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating mapping with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing mapping', async () => {
      (mappingRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await mappingService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Mapping deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (mappingRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await mappingService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting mapping with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
