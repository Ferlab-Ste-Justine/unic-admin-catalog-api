import { StatusCodes } from 'http-status-codes';

import { validateDictionaryId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { SortOrder } from '@/types';

import { DictTable, DictTableSearchFields, DictTableSortColumn, DictTableUpdate, NewDictTable } from './dictTableModel';
import { dictTableRepository } from './dictTableRepository';

export const dictTableService = {
  findAll: async (
    searchField?: DictTableSearchFields,
    searchValue?: string,
    sortBy?: DictTableSortColumn,
    sortOrder: SortOrder = 'asc'
  ): Promise<ServiceResponse<DictTable[] | null>> => {
    try {
      const dictTables = await dictTableRepository.findAll(searchField, searchValue, sortBy, sortOrder);
      if (!dictTables.length) {
        return new ServiceResponse(ResponseStatus.Success, 'No DictTables found', [], StatusCodes.OK);
      }
      return new ServiceResponse(ResponseStatus.Success, 'DictTables found', dictTables, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all dictTables: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<DictTable | null>> => {
    try {
      const dictTable = await dictTableRepository.findById(id);
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

  create: async (dictTable: NewDictTable): Promise<ServiceResponse<DictTable | null>> => {
    try {
      const dictionaryValidation = await validateDictionaryId(dictTable.dictionary_id);
      if (!dictionaryValidation.success) {
        return dictionaryValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(dictTable);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const newDictTable = await dictTableRepository.create(dictTable);
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

  update: async (id: number, dictTable: DictTableUpdate): Promise<ServiceResponse<DictTable | null>> => {
    try {
      const dictionaryValidation = await validateDictionaryId(dictTable.dictionary_id);
      if (!dictionaryValidation.success) {
        return dictionaryValidation;
      }

      const uniquenessCheck = await handleUniquenessChecks(dictTable, id);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const updatedDictTable = await dictTableRepository.update(id, dictTable);
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
      await dictTableRepository.delete(id);
      return new ServiceResponse(ResponseStatus.Success, 'DictTable deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting dictTable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (
  dictTable: NewDictTable | DictTableUpdate,
  id?: number
): Promise<ServiceResponse<null>> => {
  if (dictTable.dictionary_id) {
    const existingByDictionaryId = await dictTableRepository.findByDictionaryId(dictTable.dictionary_id);
    if (existingByDictionaryId && existingByDictionaryId.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Dict Table with dictionary_id ${dictTable.dictionary_id} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  if (dictTable.name) {
    const existingByName = await dictTableRepository.findByName(dictTable.name);
    if (existingByName && existingByName.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A Dict Table with name ${dictTable.name} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
