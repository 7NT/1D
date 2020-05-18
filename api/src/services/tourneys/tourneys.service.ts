// Initializes the `Tourneys` service on path `/tourneys`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tourneys } from './tourneys.class';
import createModel from '../../models/tourneys.model';
import hooks from './tourneys.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tourneys': Tourneys & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tourneys', new Tourneys(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tourneys');

  service.hooks(hooks);
}
