// Initializes the `tables` service on path `/tables`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tables } from './tables.class';
import hooks from './tables.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tables': Tables & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tables', new Tables(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tables');

  service.hooks(hooks);
}
