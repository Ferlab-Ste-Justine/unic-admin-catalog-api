import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, Mock, vi } from 'vitest';

import { analystRepository } from '@/api/analyst/analystRepository';
import { dictionaryRepository } from '@/api/dictionary/dictionaryRepository';
import { dictTableRepository } from '@/api/dictTable/dictTableRepository';
import { resourceRepository } from '@/api/resource/resourceRepository';
import { valueSetRepository } from '@/api/valueSet/valueSetRepository';
import { valueSetCodeRepository } from '@/api/valueSetCode/valueSetCodeRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import {
  validateAnalystId,
  validateDictionaryId,
  validateDictTableId,
  validateResourceId,
  validateValueSetCodeId,
  validateValueSetId,
} from '../helpers';

vi.mock('@/api/analyst/analystRepository');
vi.mock('@/api/dictionary/dictionaryRepository');
vi.mock('@/api/dictTable/dictTableRepository');
vi.mock('@/api/resource/resourceRepository');
vi.mock('@/api/valueSet/valueSetRepository');
vi.mock('@/api/valueSetCode/valueSetCodeRepository');

describe('validationService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateValueSetId', () => {
    it('should validate existing value set ID', async () => {
      (valueSetRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateValueSetId(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value Set ID is valid', null, StatusCodes.OK)
      );
    });

    it('should return error for non-existing value set ID', async () => {
      (valueSetRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateValueSetId(999);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Value Set with ID 999 does not exist',
          null,
          StatusCodes.BAD_REQUEST
        )
      );
    });
  });

  describe('validateValueSetCodeId', () => {
    it('should validate existing value set code ID', async () => {
      (valueSetCodeRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateValueSetCodeId(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Value Set Code ID is valid', null, StatusCodes.OK)
      );
    });

    it('should return error for non-existing value set code ID', async () => {
      (valueSetCodeRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateValueSetCodeId(999);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Value Set Code with ID 999 does not exist',
          null,
          StatusCodes.BAD_REQUEST
        )
      );
    });
  });

  describe('validateDictTableId', () => {
    it('should validate existing dict table ID', async () => {
      (dictTableRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateDictTableId(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Dict Table ID is valid', null, StatusCodes.OK)
      );
    });

    it('should return error for non-existing dict table ID', async () => {
      (dictTableRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateDictTableId(999);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Dict Table with ID 999 does not exist',
          null,
          StatusCodes.BAD_REQUEST
        )
      );
    });
  });

  describe('validateResourceId', () => {
    it('should validate existing resource ID', async () => {
      (resourceRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateResourceId(1);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Resource ID is valid', null, StatusCodes.OK));
    });

    it('should return error for non-existing resource ID', async () => {
      (resourceRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateResourceId(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Resource with ID 999 does not exist', null, StatusCodes.BAD_REQUEST)
      );
    });
  });

  describe('validateAnalystId', () => {
    it('should validate existing analyst ID', async () => {
      (analystRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateAnalystId(1);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Analyst ID is valid', null, StatusCodes.OK));
    });

    it('should return error for non-existing analyst ID', async () => {
      (analystRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateAnalystId(999);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Analyst with ID 999 does not exist', null, StatusCodes.BAD_REQUEST)
      );
    });
  });

  describe('validateDictionaryId', () => {
    it('should validate existing dictionary ID', async () => {
      (dictionaryRepository.findById as Mock).mockResolvedValueOnce({ id: 1 });

      const result = await validateDictionaryId(1);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'Dictionary ID is valid', null, StatusCodes.OK)
      );
    });

    it('should return error for non-existing dictionary ID', async () => {
      (dictionaryRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await validateDictionaryId(999);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Dictionary with ID 999 does not exist',
          null,
          StatusCodes.BAD_REQUEST
        )
      );
    });
  });
});
