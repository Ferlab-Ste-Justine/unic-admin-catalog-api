import { StatusCodes } from 'http-status-codes';

import { validateValueSetCodeId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Mapping, MappingUpdate, NewMapping } from './mappingModel';
import { mappingRepository } from './mappingRepository';

export const mappingService = {
  create: async (mapping: NewMapping): Promise<ServiceResponse<Mapping | null>> => {
    try {
      const valueSetCodeValidation = await validateValueSetCodeId(mapping.value_set_code_id);
      if (!valueSetCodeValidation.success) {
        return valueSetCodeValidation;
      }

      const newMapping = await mappingRepository.createMapping(mapping);
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

  findAll: async (): Promise<ServiceResponse<Mapping[] | null>> => {
    try {
      const mappings = await mappingRepository.findAllMappings();
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
      const mapping = await mappingRepository.findMappingById(id);
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

  update: async (id: number, mapping: MappingUpdate): Promise<ServiceResponse<Mapping | null>> => {
    try {
      const valueSetCodeValidation = await validateValueSetCodeId(mapping.value_set_code_id);
      if (!valueSetCodeValidation.success) {
        return valueSetCodeValidation;
      }

      const updatedMapping = await mappingRepository.updateMapping(id, mapping);
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
      await mappingRepository.deleteMapping(id);
      return new ServiceResponse(ResponseStatus.Success, 'Mapping deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting mapping with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
