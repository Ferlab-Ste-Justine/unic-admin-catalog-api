import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { AnalystTable } from '@/api/analyst/analystModel';
import { DictionaryTable } from '@/api/dictionary/dictionaryModel';
import { DictTableTable } from '@/api/dictTable/dictTableModel';
import { MappingTable } from '@/api/mapping/mappingModel';
import { ResourceTable } from '@/api/resource/resourceModel';
import { RefreshTokenTable, UserTable } from '@/api/user/userModel';
import { ValueSetTable } from '@/api/valueSet/valueSetModel';
import { ValueSetCodeTable } from '@/api/valueSetCode/valueSetCodeModel';
import { VariableTable } from '@/api/variable/variableModel';

export interface Database {
  'catalog.analyst': AnalystTable;
  'catalog.user': UserTable;
  'catalog.resource': ResourceTable;
  'catalog.value_set': ValueSetTable;
  'catalog.dictionary': DictionaryTable;
  'catalog.dict_table': DictTableTable;
  'catalog.variable': VariableTable;
  'catalog.value_set_code': ValueSetCodeTable;
  'catalog.mapping': MappingTable;
  'catalog.refresh_token': RefreshTokenTable;
}

export type SortOrder = 'asc' | 'desc';

export const VARIABLE_TABLE = 'catalog.variable';
export const DICT_TABLE_TABLE = 'catalog.dict_table';
export const VALUE_SET_TABLE = 'catalog.value_set';
export const ANALYST_TABLE = 'catalog.analyst';
export const RESOURCE_TABLE = 'catalog.resource';
export const DICTIONARY_TABLE = 'catalog.dictionary';
export const MAPPING_TABLE = 'catalog.mapping';
export const VALUE_SET_CODE_TABLE = 'catalog.value_set_code';
export const USER_TABLE = 'catalog.user';
export const REFRESH_TOKEN_TABLE = 'catalog.refresh_token';

export interface TokenPayload extends JwtPayload {
  user_id: number;
}

export interface JwtRequest extends Request {
  user_id: number;
}

export type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};
