import { StatusCodes } from 'http-status-codes';

import { validateValueSetId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { NewValueSetCode, ValueSetCode, ValueSetCodeUpdate } from './valueSetCodeModel';
import { valueSetCodeRepository } from './valueSetCodeRepository';

export const valueSetCodeService = {
  findAll: async (): Promise<ServiceResponse<ValueSetCode[] | null>> => {
    try {
      const valueSetCodes = await valueSetCodeRepository.findAll();
      if (!valueSetCodes.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Value Set Codes found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Value Set Codes found', valueSetCodes, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all value set codes: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<ValueSetCode | null>> => {
    try {
      const valueSetCode = await valueSetCodeRepository.findById(id);
      if (valueSetCode) {
        return new ServiceResponse(ResponseStatus.Success, 'Value Set Code found', valueSetCode, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Value Set Code not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding value set code with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (valueSetCode: NewValueSetCode): Promise<ServiceResponse<ValueSetCode | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(valueSetCode.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(valueSetCode);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newValueSetCode = await valueSetCodeRepository.create(valueSetCode);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Value Set Code created successfully',
        newValueSetCode,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating value set code: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, valueSetCode: ValueSetCodeUpdate): Promise<ServiceResponse<ValueSetCode | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(valueSetCode.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(valueSetCode);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedValueSetCode = await valueSetCodeRepository.update(id, valueSetCode);
      if (updatedValueSetCode) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Value Set Code updated successfully',
          updatedValueSetCode,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Value Set Code not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating value set code with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await valueSetCodeRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Value Set Code deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting value set code with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  valueSetCode: NewValueSetCode | ValueSetCodeUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (valueSetCode.value_set_id) {
    const existingByValueSetId = await valueSetCodeRepository.findByValueSetId(valueSetCode.value_set_id);
    if (existingByValueSetId && existingByValueSetId.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Value Set Code with value_set_id ${valueSetCode.value_set_id} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  if (valueSetCode.code) {
    const existingByCode = await valueSetCodeRepository.findByCode(valueSetCode.code);
    if (existingByCode && existingByCode.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Value Set Code with original_value "${valueSetCode.code}" already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
