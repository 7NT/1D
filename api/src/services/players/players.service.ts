// Initializes the `players` service on path `/players`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Players } from './players.class';
import hooks from './players.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'players': Players & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    // multi: ['patch'],
    paginate: {
      default: 500,
      max: 1000
    }
  };

  // Initialize our service with any options it requires
  app.use('/players', new Players(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('players');

  service.hooks(hooks);
}
