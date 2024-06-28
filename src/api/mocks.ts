import { Analyst } from '@/api/analyst/analystModel';
import { Dictionary } from '@/api/dictionary/dictionaryModel';
import { DictTable } from '@/api/dictTable/dictTableModel';
import { Mapping } from '@/api/mapping/mappingModel';
import { Resource } from '@/api/resource/resourceModel';
import { PublicUser, User } from '@/api/user/userModel';
import { ValueSet } from '@/api/valueSet/valueSetModel';
import { ValueSetCode } from '@/api/valueSetCode/valueSetCodeModel';
import { Variable } from '@/api/variable/variableModel';

export const mockAnalyst: Analyst = {
  id: 1,
  last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
  name: 'Analyst 1',
};

export const invalidMockAnalyst = {
  id: 1,
  last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
  name: 123,
};

export const mockResource: Resource = {
  id: 1,
  last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
  code: 'R1',
  name: 'Resource 1',
  title: 'Title 1',
  resource_type: 'warehouse',
  description_en: 'Description in English',
  description_fr: 'Description in French',
  principal_investigator: 'Investigator Name',
  erb_project_id: 'ERB123',
  project_creation_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
  project_active: 'active',
  project_status: 'in progress',
  project_approved: true,
  project_folder: 'folder/path',
  project_approval_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
  project_completion_date: '2024-06-13T19:53:41.824Z' as unknown as Date,
  to_be_published: true,
  system_database_type: 'Type A',
  analyst_id: 1,
  system_collection_starting_year: 2020,
  analyst_name: 'Analyst Name',
};

export const invalidMockResource = {
  name: 'New Resource',
  code: 'NR',
  title: 'New Title',
  resource_type: 'warehouse',
  description_en: 'New description in English',
  description_fr: 'New description in French',
  principal_investigator: 'New Investigator',
  erb_project_id: 'ERB124',
  project_creation_date: 'invalid-date',
  project_active: 'active',
  project_status: 'in progress',
  project_approved: true,
  project_folder: 'new/folder/path',
  project_approval_date: new Date(),
  project_completion_date: new Date(),
  to_be_published: true,
  system_database_type: 'Type B',
  analyst_id: 1,
  system_collection_starting_year: 2021,
  analyst_name: 'New Analyst Name',
};

export const invalidMockVariable = {
  id: 1,
  last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
  name: 123,
};

export const mockVariable: Variable = {
  id: 1,
  last_update: '2024-06-13T19:53:41.824Z' as unknown as Date,
  table_id: 1,
  name: 'VariableTable1',
  path: '/path/to/variable',
  value_type: 'integer',
  label_fr: 'Label FR',
  label_en: 'Label EN',
  value_set_id: 1,
  from_variable_id: [1, 2],
  derivation_algorithm: 'Algorithm',
  notes: 'Some notes here',
  variable_status: 'to_do',
  rolling_version: 'current',
  to_be_published: true,
};

export const invalidMockDictionary = {
  resource_id: '21234',
  current_version: 1,
};
export const mockDictionary: Dictionary = {
  id: 12345,
  resource_id: 101,
  last_update: '2024-06-17T00:00:00Z' as unknown as Date,
  current_version: 1,
  to_be_published: true,
};

export const invalidMockDictTable = {
  dictionary_id: '101',
  name: 'Example Table',
  label_en: 'Example Label EN',
  label_fr: 'Exemple d’étiquette FR',
  row_filter: 'status = active',
  to_be_published: true,
};

export const mockDictTable: DictTable = {
  id: 1,
  last_update: '2024-06-17T00:00:00Z' as unknown as Date,
  dictionary_id: 101,
  name: 'Example Table',
  entity_type: 'patient',
  domain: 'sociodemographics',
  label_en: 'Example Label EN',
  label_fr: 'Exemple d’étiquette FR',
  row_filter: 'status = active',
  to_be_published: true,
};

export const invalidMockMapping = {
  id: 1,
  value_set_code_id: '101',
};

export const mockMapping: Mapping = {
  id: 1,
  last_update: '2024-06-17T00:00:00Z' as unknown as Date,
  value_set_code_id: 101,
  original_value: 'example_value',
};

export const mockUser: User = {
  id: 1,
  name: 'Mock User',
  email: 'mockuser@example.com',
  password: 'Newpassword!23',
  created_at: new Date().toString() as unknown as Date,
  updated_at: new Date().toString() as unknown as Date,
};

export const mockPublicUser: PublicUser = {
  id: 1,
  name: 'Mock User',
  email: 'mockuser@example.com',
  created_at: new Date().toString() as unknown as Date,
  updated_at: new Date().toString() as unknown as Date,
};

export const invalidMockUser = {
  name: 123,
  email: 'invalidemail',
};

export const invalidMockValueSet = {
  id: 1,
  last_update: '2023-06-15T00:00:00Z' as unknown as Date,
  name: 'TestValueSet',
  description_en: 'This is a test value set description in English.',
  description_fr: 'Ceci est une description de jeu de valeurs de test en français.',
  url: 1234,
};

export const mockValueSet: ValueSet = {
  id: 1,
  last_update: '2023-06-15T00:00:00Z' as unknown as Date,
  name: 'TestValueSet',
  description_en: 'This is a test value set description in English.',
  description_fr: 'Ceci est une description de jeu de valeurs de test en français.',
  url: 'https://example.com/valueset',
};

export const invalidMockValueSetCode = {
  id: 1,
  value_set_id: '1',
  last_update: new Date().toString() as unknown as Date,
  code: 'example_code',
  label_fr: 'exemple étiquette',
  label_en: 'example label',
};

export const mockValueSetCode: ValueSetCode = {
  id: 1,
  value_set_id: 1,
  last_update: new Date().toString() as unknown as Date,
  code: 'example_code',
  label_fr: 'exemple étiquette',
  label_en: 'example label',
};
