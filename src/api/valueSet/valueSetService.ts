import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { NewValueSet, ValueSet, ValueSetUpdate } from './valueSetModel';
import { valueSetRepository } from './valueSetRepository';

export const valueSetService = {
  findAll: async (name?: string): Promise<ServiceResponse<ValueSet[] | null>> => {
    try {
      const valueSets = await valueSetRepository.findAllValueSets(name);
      if (!valueSets.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No value sets found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Value sets found', valueSets, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all value sets: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<ValueSet | null>> => {
    try {
      const valueSet = await valueSetRepository.findValueSetById(id);
      if (valueSet) {
        return new ServiceResponse(ResponseStatus.Success, 'Value set found', valueSet, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding value set with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (valueSet: NewValueSet): Promise<ServiceResponse<ValueSet | null>> => {
    try {
      const newValueSet = await valueSetRepository.createValueSet(valueSet);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Value set created successfully',
        newValueSet,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating value set: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, valueSet: ValueSetUpdate): Promise<ServiceResponse<ValueSet | null>> => {
    try {
      const updatedValueSet = await valueSetRepository.updateValueSet(id, valueSet);
      if (updatedValueSet) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Value set updated successfully',
          updatedValueSet,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Value set not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating value set with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await valueSetRepository.deleteValueSet(id);
      return new ServiceResponse(ResponseStatus.Success, 'Value set deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting value set with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
