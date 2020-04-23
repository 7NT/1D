import { Service, MemoryServiceOptions } from 'feathers-memory';
import { Application } from '../../declarations';
import { Params } from 'express-serve-static-core';

// A type interface for our user (it does not validate any data)
interface PlayerData {
  id: string;
  nick?: string;
  profile?: { avatar?: string; flag?: string };
  state: number,
  seat: { tId?: string; sId?: number }
}

export class Players extends Service {
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }

  create (data: PlayerData, params?: Params) {
    // This is the information we want from the player enter lobby
    const { id, nick, profile, state, seat } = data;
    // The complete player
    const playerData = {
      id,
      nick,
      profile,
      state,
      seat
    };

    return super.create(playerData, params);
  }
};
