// import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Service, MemoryServiceOptions } from 'feathers-memory';
import { Application } from '../../declarations';

export class Tables extends Service {
  // constructor(options: Partial<MongooseServiceOptions>, app: Application) {
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }
}
