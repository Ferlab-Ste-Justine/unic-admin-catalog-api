import { StatusCodes } from 'http-status-codes';

import { validateResourceId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { Dictionary, DictionaryUpdate, NewDictionary } from './dictionaryModel';
import { dictionaryRepository } from './dictionaryRepository';

export const dictionaryService = {
  findAll: async (): Promise<ServiceResponse<Dictionary[] | null>> => {
    try {
      const dictionaries = await dictionaryRepository.findAll();
      if (!dictionaries.length) {
        return new ServiceResponse(ResponseStatus.Success, 'No dictionaries found', [], StatusCodes.OK);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Dictionaries found', dictionaries, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all dictionaries: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Dictionary | null>> => {
    try {
      const dictionary = await dictionaryRepository.findById(id);
      if (dictionary) {
        return new ServiceResponse(ResponseStatus.Success, 'Dictionary found', dictionary, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding dictionary with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (dictionary: NewDictionary): Promise<ServiceResponse<Dictionary | null>> => {
    try {
      const resourceValidation = await validateResourceId(dictionary.resource_id);
      if (!resourceValidation.success) {
        return resourceValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(dictionary);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newDictionary = await dictionaryRepository.create(dictionary);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Dictionary created successfully',
        newDictionary,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating dictionary: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, dictionary: DictionaryUpdate): Promise<ServiceResponse<Dictionary | null>> => {
    try {
      const resourceValidation = await validateResourceId(dictionary.resource_id);
      if (!resourceValidation.success) {
        return resourceValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(dictionary, id);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedDictionary = await dictionaryRepository.update(id, dictionary);
      if (updatedDictionary) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Dictionary updated successfully',
          updatedDictionary,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Dictionary not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating dictionary with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await dictionaryRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'Dictionary deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting dictionary with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  dictionary: NewDictionary | DictionaryUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (dictionary.resource_id) {
    const existingByResourceId = await dictionaryRepository.findByResourceId(dictionary.resource_id);
    if (existingByResourceId && existingByResourceId.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Dictionary with resource_id ${dictionary.resource_id} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
