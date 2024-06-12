import { StatusCodes } from 'http-status-codes';

import { validateValueSetId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { NewValueSetCode, ValueSetCode, ValueSetCodeUpdate } from './valueSetCodeModel';
import { valueSetCodeRepository } from './valueSetCodeRepository';

export const valueSetCodeService = {
  create: async (valueSetCode: NewValueSetCode): Promise<ServiceResponse<ValueSetCode | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(valueSetCode.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const newValueSetCode = await valueSetCodeRepository.createValueSetCode(valueSetCode);
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

  findAll: async (): Promise<ServiceResponse<ValueSetCode[] | null>> => {
    try {
      const valueSetCodes = await valueSetCodeRepository.findAllValueSetCodes();
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
      const valueSetCode = await valueSetCodeRepository.findValueSetCodeById(id);
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

  update: async (id: number, valueSetCode: ValueSetCodeUpdate): Promise<ServiceResponse<ValueSetCode | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(valueSetCode.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const updatedValueSetCode = await valueSetCodeRepository.updateValueSetCode(id, valueSetCode);
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
      await valueSetCodeRepository.deleteValueSetCode(id);
      return new ServiceResponse(ResponseStatus.Success, 'Value Set Code deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting value set code with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
