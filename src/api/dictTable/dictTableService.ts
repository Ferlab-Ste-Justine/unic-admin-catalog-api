import { StatusCodes } from 'http-status-codes';

import { dictionaryRepository } from '@/api/dictionary/dictionaryRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { DictTable, DictTableUpdate, NewDictTable } from './dictTableModel';
import { dictTableRepository } from './dictTableRepository';

export const dictTableService = {
  create: async (dictTable: NewDictTable): Promise<ServiceResponse<DictTable | null>> => {
    try {
      if (dictTable.dictionary_id) {
        const analystExists = await dictionaryRepository.findDictionaryById(dictTable.dictionary_id);
        if (!analystExists) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'Dictionary ID does not exist',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const newDictTable = await dictTableRepository.createDictTable(dictTable);
      return new ServiceResponse(
        ResponseStatus.Success,
        'DictTable created successfully',
        newDictTable,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating dictTable: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findAll: async (name?: string): Promise<ServiceResponse<DictTable[] | null>> => {
    try {
      const dictTables = await dictTableRepository.findAllDictTables(name);
      if (!dictTables.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No DictTables found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'DictTables found', dictTables, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all analysts: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<DictTable | null>> => {
    try {
      const dictTable = await dictTableRepository.findDictTableById(id);
      if (dictTable) {
        return new ServiceResponse(ResponseStatus.Success, 'DictTable found', dictTable, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding dictTable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, dictTable: DictTableUpdate): Promise<ServiceResponse<DictTable | null>> => {
    try {
      if (dictTable.dictionary_id) {
        const analystExists = await dictionaryRepository.findDictionaryById(dictTable.dictionary_id);
        if (!analystExists) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'Dictionary ID does not exist',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
      }
      const updatedDictTable = await dictTableRepository.updateDictTable(id, dictTable);
      if (updatedDictTable) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'DictTable updated successfully',
          updatedDictTable,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'DictTable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating dictTable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await dictTableRepository.deleteDictTable(id);
      return new ServiceResponse(ResponseStatus.Success, 'DictTable deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting dictTable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
