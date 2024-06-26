import { StatusCodes } from 'http-status-codes';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { validateValueSetId } from '@/api/helpers';
import { mockValueSetCode } from '@/api/mocks';
import { ValueSetCode } from '@/api/valueSetCode/valueSetCodeModel';
import { valueSetCodeRepository } from '@/api/valueSetCode/valueSetCodeRepository';
import { valueSetCodeService } from '@/api/valueSetCode/valueSetCodeService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/valueSetCode/valueSetCodeRepository');
vi.mock('@/api/helpers', () => ({
  validateValueSetId: vi.fn(),
}));

describe('valueSetCodeService', () => {
  beforeEach(() => {
    (validateValueSetId as Mock).mockResolvedValue(
      new ServiceResponse(ResponseStatus.Success, 'Value Set ID is valid', null, StatusCodes.OK)
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all value set codes', async () => {
      (valueSetCodeRepository.findAll as Mock).mockResolvedValueOnce([mockValueSetCode]);

      const result = await valueSetCodeService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value Set Codes found', [mockValueSetCode], StatusCodes.OK)
      );
    });

    it('should return not found if no value set codes are found', async () => {
      (valueSetCodeRepository.findAll as Mock).mockResolvedValueOnce([]);

      const result = await valueSetCodeService.findAll();

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'No Value Set Codes found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findAll', async () => {
      (valueSetCodeRepository.findAll as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetCodeService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding all value set codes: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findById', () => {
    it('should return a value set code by id', async () => {
      (valueSetCodeRepository.findById as Mock).mockResolvedValueOnce(mockValueSetCode);

      const result = await valueSetCodeService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value Set Code found', mockValueSetCode, StatusCodes.OK)
      );
    });

    it('should return not found if value set code is not found', async () => {
      (valueSetCodeRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await valueSetCodeService.findById(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Value Set Code not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during findById', async () => {
      (valueSetCodeRepository.findById as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetCodeService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error finding value set code with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('create', () => {
    it('should create a new value set code', async () => {
      (valueSetCodeRepository.create as Mock).mockResolvedValueOnce(mockValueSetCode);

      const result = await valueSetCodeService.create(mockValueSetCode);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Value Set Code created successfully',
          mockValueSetCode,
          StatusCodes.CREATED
        )
      );
    });

    it('should handle validation errors during create', async () => {
      (validateValueSetId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid value set ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await valueSetCodeService.create(mockValueSetCode);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid value set ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for value_set_id during create', async () => {
      (valueSetCodeRepository.findByValueSetId as Mock).mockResolvedValueOnce({ ...mockValueSetCode, id: 2 });

      const result = await valueSetCodeService.create(mockValueSetCode);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set Code with value_set_id ${mockValueSetCode.value_set_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for code during create', async () => {
      (valueSetCodeRepository.findByCode as Mock).mockResolvedValueOnce({ ...mockValueSetCode, id: 2 });

      const result = await valueSetCodeService.create(mockValueSetCode);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set Code with code ${mockValueSetCode.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during create', async () => {
      (valueSetCodeRepository.create as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetCodeService.create(mockValueSetCode);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error creating value set code: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    const updatedDictionary: ValueSetCode = {
      ...mockValueSetCode,
      code: 'New Code',
    };

    it('should update an existing value set code', async () => {
      (valueSetCodeRepository.update as Mock).mockResolvedValueOnce(updatedDictionary);

      const result = await valueSetCodeService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Value Set Code updated successfully',
          updatedDictionary,
          StatusCodes.OK
        )
      );
    });

    it('should handle validation errors during update', async () => {
      (validateValueSetId as Mock).mockResolvedValueOnce(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid value set ID', null, StatusCodes.BAD_REQUEST)
      );

      const result = await valueSetCodeService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid value set ID', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle uniqueness check errors for value_set_id during update', async () => {
      (valueSetCodeRepository.findByValueSetId as Mock).mockResolvedValueOnce({ ...updatedDictionary, id: 2 });

      const result = await valueSetCodeService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set Code with value_set_id ${updatedDictionary.value_set_id} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle uniqueness check errors for code during update', async () => {
      (valueSetCodeRepository.findByCode as Mock).mockResolvedValueOnce({ ...updatedDictionary, id: 2 });

      const result = await valueSetCodeService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A Value Set Code with code ${updatedDictionary.code} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should return not found if value set code is not found for update', async () => {
      (valueSetCodeRepository.update as Mock).mockResolvedValueOnce(null);

      const result = await valueSetCodeService.update(999, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Value Set Code not found', null, StatusCodes.NOT_FOUND)
      );
    });

    it('should handle errors during update', async () => {
      (valueSetCodeRepository.update as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetCodeService.update(1, updatedDictionary);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error updating value set code with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing value set code', async () => {
      (valueSetCodeRepository.delete as Mock).mockResolvedValueOnce(null);

      const result = await valueSetCodeService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value Set Code deleted successfully', null, StatusCodes.OK)
      );
    });

    it('should handle errors during delete', async () => {
      (valueSetCodeRepository.delete as Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const result = await valueSetCodeService.delete(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error deleting value set code with id 1: Database connection error',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
