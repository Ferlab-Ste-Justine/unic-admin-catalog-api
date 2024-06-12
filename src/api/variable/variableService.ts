import { StatusCodes } from 'http-status-codes';

import { validateTableId, validateValueSetId } from '@/api/helpers';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { NewVariable, Variable, VariableUpdate } from './variableModel';
import { variableRepository } from './variableRepository';

export const variableService = {
  create: async (variable: NewVariable): Promise<ServiceResponse<Variable | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(variable.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const tableValidation = await validateTableId(variable.table_id);
      if (!tableValidation.success) {
        return tableValidation;
      }

      const newVariable = await variableRepository.createVariable(variable);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Variable created successfully',
        newVariable,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating variable: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findAll: async (name?: string): Promise<ServiceResponse<Variable[] | null>> => {
    try {
      const variables = await variableRepository.findAllVariables(name);
      if (!variables.length) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Variables found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Variables found', variables, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all variables: ${(error as Error).message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Variable | null>> => {
    try {
      const variable = await variableRepository.findVariableById(id);
      if (variable) {
        return new ServiceResponse(ResponseStatus.Success, 'Variable found', variable, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error finding variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: number, variable: VariableUpdate): Promise<ServiceResponse<Variable | null>> => {
    try {
      const valueSetValidation = await validateValueSetId(variable.value_set_id);
      if (!valueSetValidation.success) {
        return valueSetValidation;
      }

      const tableValidation = await validateTableId(variable.table_id);
      if (!tableValidation.success) {
        return tableValidation;
      }

      const updatedVariable = await variableRepository.updateVariable(id, variable);
      if (updatedVariable) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Variable updated successfully',
          updatedVariable,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Variable not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (error) {
      const errorMessage = `Error updating variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse> => {
    try {
      await variableRepository.deleteVariable(id);
      return new ServiceResponse(ResponseStatus.Success, 'Variable deleted successfully', null, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error deleting variable with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};