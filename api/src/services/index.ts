import { Application } from '../declarations';
import users from './users/users.service';
import messages from './messages/messages.service';
import players from './players/players.service';
import tables from './tables/tables.service';
import boards from './boards/boards.service';
import bids from './bids/bids.service';
import plays from './plays/plays.service';
import results from './results/results.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users);
  app.configure(messages);
  app.configure(players);
  app.configure(tables);
  app.configure(boards);
  app.configure(bids);
  app.configure(plays);
  app.configure(results);
}
