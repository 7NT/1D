import { Application } from '../declarations'
import users from './users/users.service'
import chats from './chats/chats.service'
import players from './players/players.service'
import tables from './tables/tables.service'
import boards from './boards/boards.service'
import results from './results/results.service'
import played from './played/played.service'
import tourneys from './tourneys/tourneys.service'
import teams from './teams/teams.service'
import notifications from './notifications/notifications.service'
import subscription from './subscription/subscription.service'
// import push from './push/push.service'
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users)
  app.configure(chats)
  app.configure(players)
  app.configure(tables)
  app.configure(boards)
  app.configure(results)
  app.configure(played)
  app.configure(tourneys)
  app.configure(teams)
  app.configure(notifications)
  app.configure(subscription)
  // app.configure(push)
}
