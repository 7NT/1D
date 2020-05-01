// import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Service, MemoryServiceOptions } from 'feathers-memory';
import { Application } from '../../declarations';

export class Chats extends Service {
  // constructor(options: Partial<NedbServiceOptions>, app: Application) {
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }
};
