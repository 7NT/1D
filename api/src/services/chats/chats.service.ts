// Initializes the `chats` service on path `/chats`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Chats } from './chats.class';
import hooks from './chats.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'chats': Chats & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/chats', new Chats(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('chats');

  service.hooks(hooks);

  service.publish('created', data => {
    if (data.to.startsWith('@')) {
      return [
             app.channel(data.to),
             app.channel(`@${data.from.id}`)
        ];
    } else return app.channel(data.to)
  });
}
