// Initializes the `played` service on path `/played`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Played } from './played.class';
import createModel from '../../models/played.model';
import hooks from './played.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'played': Played & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/played', new Played(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('played');

  service.hooks(hooks);
}
