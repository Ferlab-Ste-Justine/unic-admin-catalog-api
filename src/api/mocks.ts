import { Analyst } from '@/api/analyst/analystModel';
import { Resource } from '@/api/resource/resourceModel';
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
