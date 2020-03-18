import '@feathersjs/transport-commons';
import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';

export default function (app: Application) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }
  const playerService = app.service('players')

  // Join a channel given a user and connection
  const joinChannels = (user: any, connection: any) => {
    //app.channel('authenticated').join(connection);
    app.channel('#Lobby').join(connection);
    // Assuming that the chat room/user assignment is stored
    // on an array of the user
    /*
    user.rooms.forEach((room:any) =>
      app.channel(`rooms/${(roomId:any)}`).join(connection)
    );
    */
    // Easily organize users by email and userid for things like messaging
    // app.channel(`emails/${user.email}`).join(channel);
    //app.channel(`userIds/${user._id}`).join(connection);
    app.channel(`@${user._id}`).join(connection);
  }

  // Get a user to leave all channels
  const leaveChannels = (user: any) => {
    app.channel(app.channels).leave((connection: any) =>
      connection.user._id === user._id
    );
  }

  // Leave and re-join all channels with new user information
  const updateChannels = (user: any) => {
    // Find all connections for this user
    const { connections } = app.channel(app.channels).filter(connection =>
      connection.user._id === user._id
    );

    // Leave all channels
    leaveChannels(user);

    // Re-join all channels with the updated user information
    connections.forEach(connection => joinChannels(user, connection));
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('#anonymous').join(connection);
  });

  app.on('disconnect', (connection: any) => {
    console.log('disconnect', connection);
  })

  app.on('login', (authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      const user = connection.user;

      joinChannels(user, connection)

      const playerData = {
        id: user._id,
        nick: user.nick,
        avatar: user.avatar,
        country: user.country,
        state: 0,
        tId: user.tId || null,
        sId: user.sId || 0
      };
      playerService.create(playerData);

      // The connection is no longer anonymous, remove it
      //app.channel('#anonymous').leave(connection);

      // Add it to the authenticated user channel
      //app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 

      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel));

      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(channel);
      // app.channel(`userIds/$(user.id}`).join(channel);
    }
  });

  app.on('logout', (payload: any, { connection }: any) => {
    if (connection) {
      const user = connection.user;
      //When logging out, leave all channels before joining anonymous channel
      console.log('logout', app.channels);
      // app.channel(app.channels).leave(connection);
      //app.channel('anonymous').join(connection);
      app.channel('#Anonymous').join(connection);

      playerService.remove(user._id);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, hook: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    //return app.channel('authenticated');
    return app.channel('#Lobby');
  });

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));

  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
  app.service('players').on('updated', updateChannels);
  app.service('players').on('patched', updateChannels);
  // On `removed`, remove the connection from all channels
  app.service('players').on('removed', leaveChannels);
};
