import { Db } from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';

export class Played extends Service {
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);
  }
};
