import '@feathersjs/transport-commons'
import { HookContext } from '@feathersjs/feathers'
import { Application } from './declarations'
// import usersHooks from './services/users/users.hooks'

import * as admin from 'firebase-admin'

export default function (app: Application) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }
  // const userService = app.service('users')
  const tables$ = app.service('tables')
  const players$ = app.service('players')

  // Join a channel given a user and connection
  const joinChannels = (user: any, connection: any) => {
    app.channel('#Lobby').join(connection)
    app.channel(`@${user._id}`).join(connection)
  }

  // Get a user to leave all channels
  const leaveChannels = (user: any) => {
    app
      .channel(app.channels)
      .leave((connection: any) => connection.user._id === user._id)
  }

  // Leave and re-join all channels with new user information
  const updateChannels = (user: any) => {
    // Find all connections for this user
    const { connections } = app
      .channel(app.channels)
      .filter(connection => connection.user._id === user._id)

    // Leave all channels
    leaveChannels(user)

    // Re-join all channels with the updated user information
    connections.forEach(connection => joinChannels(user, connection))
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    // console.log('connect', connection)
    app.channel('#Anonymous').join(connection)
  })

  app.on('disconnect', (connection: any) => {
    // console.log('disconnect', connection)
    const user = connection.user
    if (user) {
      //When logging out, leave all channels before joining anonymous channel
      if (app.channels.length) app.channel(app.channels).leave(connection)
      // app.channel('#Anonymous').join(connection)

      players$.remove(user._id)
    }
  })

  app.on('login', async (authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    // console.log('login', authResult, connection);
    if (connection) {
      // Obtain the logged in user from the connection
      const user = connection.user
      user.state = 1
      // console.log('login', user)
      joinChannels(user, connection)

      const player = {
        id: user._id,
        nick: user.nick || null,
        locale: user.locale,
        avatar: user.avatar,
        status: user.status || 0,
        state: 0,
        ranks: user.ranks,
        seat: { sId: 0 }
      }
      try {
        if (user.seat.sId > 0 && user.seat.sId < 5) {
          const dt = new Date().getTime() - user.logoutAt
          const mm = Math.floor(dt / 1000 / 60)
          if (mm < 5) {
            const t1 = await tables$.get(user.seat.tId)
            if (t1.id === user.seat.tId) {
              player.seat = user.seat
            }
          }
        }
      } catch (err) {
        // console.log('login', err)
      }
      players$.create(player)

      // Send a message to devices subscribed to the provided topic.
      /*
      try {
        var message = {
          notification: {
            title: 'Login: ' + user.nick
            // bosy: 'welcome...'
          },
          topic: 'Notifications',
        }

        admin.messaging().send(message)
          .then((response) => {
            // Response is a message ID string.
            // console.log('Successfully sent message:', response)
          })
          .catch((error) => {
            // console.log('Error sending message:', error)
          })
      } catch (_) { }
      */
    }
  })

  app.on('logout', (payload: any, { connection }: any) => {
    // console.log('logout', connection)
    if (connection) {
      const user = connection.user
      user.state = 0

      // console.log('logout', user)
      //When logging out, leave all channels before joining anonymous channel
      if (app.channels.length) app.channel(app.channels).leave(connection)
      //app.channel('#Anonymous').join(connection)
      players$.remove(user._id)
    }
  })

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, hook: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.') // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    //return app.channel('authenticated')
    return app.channel('#Lobby')
  })

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'))

  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ]
  // })
  // app.service('players').on('updated', updateChannels)
  // app.service('players').on('patched', updateChannels)
  // On `removed`, remove the connection from all channels
  players$.on('removed', leaveChannels)
}
