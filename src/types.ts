import { AnalystTable } from '@/api/analyst/analystModel';
import { DictionaryTable } from '@/api/dictionary/dictionaryModel';
import { DictTableTable } from '@/api/dictTable/dictTableModel';
import { ResourceTable } from '@/api/resource/resourceModel';
import { UserTable } from '@/api/user/userModel';
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
}
