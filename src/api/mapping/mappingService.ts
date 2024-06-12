import { StatusCodes } from 'http-status-codes';

import { validateValueSetCodeId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Mapping, MappingUpdate, NewMapping } from './mappingModel';
import { mappingRepository } from './mappingRepository';

export const mappingService = {
  findAll: async (): Promise<ServiceResponse<Mapping[] | null>> => {
    try {
      const mappings = await mappingRepository.findAll();
      if (!mappings.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Mappings found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Mappings found', mappings, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all mappings: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Mapping | null>> => {
    try {
      const mapping = await mappingRepository.findById(id);
      if (mapping) {
        return new ServiceResponse(ResponseStatus.Success, 'Mapping found', mapping, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding mapping with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (mapping: NewMapping): Promise<ServiceResponse<Mapping | null>> => {
    try {
      const valueSetCodeValidation = await validateValueSetCodeId(mapping.value_set_code_id);
      if (!valueSetCodeValidation.success) {
        return valueSetCodeValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(mapping);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newMapping = await mappingRepository.create(mapping);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Mapping created successfully',
        newMapping,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating mapping: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, mapping: MappingUpdate): Promise<ServiceResponse<Mapping | null>> => {
    try {
      const valueSetCodeValidation = await validateValueSetCodeId(mapping.value_set_code_id);
      if (!valueSetCodeValidation.success) {
        return valueSetCodeValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(mapping);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedMapping = await mappingRepository.update(id, mapping);
      if (updatedMapping) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Mapping updated successfully',
          updatedMapping,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Mapping not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating mapping with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await mappingRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Mapping deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting mapping with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  mapping: NewMapping | MappingUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (mapping.value_set_code_id) {
    const existingByValueSetCodeId = await mappingRepository.findByValueSetCodeId(mapping.value_set_code_id);
    if (existingByValueSetCodeId && existingByValueSetCodeId.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Mapping with value_set_code_id ${mapping.value_set_code_id} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  if (mapping.original_value) {
    const existingByOriginalValue = await mappingRepository.findByOriginalValue(mapping.original_value);
    if (existingByOriginalValue && existingByOriginalValue.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Mapping with original_value "${mapping.original_value}" already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
