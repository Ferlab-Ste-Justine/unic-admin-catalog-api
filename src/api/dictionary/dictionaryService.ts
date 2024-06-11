import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { resourceRepository } from '../resource/resourceRepository';
import { Dictionary, DictionaryUpdate, NewDictionary } from './dictionaryModel';
import { dictionaryRepository } from './dictionaryRepository';

export const dictionaryService = {
  findAll: async (): Promise<ServiceResponse<Dictionary[] | null>> => {
    try {
      const dictionaries = await dictionaryRepository.findAllDictionaries();
      if (!dictionaries.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No dictionaries found', null, StatusCodes.NOT_FOUND);
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
      const dictionary = await dictionaryRepository.findDictionaryById(id);
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
      if (dictionary.resource_id) {
        const resourceExists = await resourceRepository.findResourceById(dictionary.resource_id);
        if (!resourceExists) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            `Resource with ID ${dictionary.resource_id} does not exist`,
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const newDictionary = await dictionaryRepository.createDictionary(dictionary);
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
      if (dictionary.resource_id) {
        const resourceExists = await resourceRepository.findResourceById(dictionary.resource_id);
        if (!resourceExists) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            `Resource with ID ${dictionary.resource_id} does not exist`,
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const updatedDictionary = await dictionaryRepository.updateDictionary(id, dictionary);
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
      await dictionaryRepository.deleteDictionary(id);
      return new ServiceResponse(ResponseStatus.Success, 'Dictionary deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting dictionary with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
