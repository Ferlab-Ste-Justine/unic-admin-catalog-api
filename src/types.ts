import { AnalystTable } from '@/api/analyst/analystModel';
import { ResourceTable } from '@/api/resource/resourceModel';
import { UserTable } from '@/api/user/userModel';
import { ValueSetTable } from '@/api/valueSet/valueSetModel';

export interface Database {
  'catalog.analyst': AnalystTable;
  'catalog.user': UserTable;
  'catalog.resource': ResourceTable;
  'catalog.value_set': ValueSetTable;
}
