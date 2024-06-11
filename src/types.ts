import { AnalystTable } from '@/api/analyst/analystModel';
import { ResourceTable } from '@/api/resource/resourceModel';
import { UserTable } from '@/api/user/userModel';

export interface Database {
  'catalog.analyst': AnalystTable;
  'catalog.user': UserTable;
  'catalog.resource': ResourceTable;
}
