import crypto from 'crypto';
import { Params } from '@feathersjs/feathers';
import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';

// A type interface for our user (it does not validate any data)
interface UserData {
  _id?: string;
  nick: string;
  email: string;
  password: string;
  status?: number;
  state?: number;
  profile?: any;
  seat?: any,
  created?: number;
}

export class Users extends Service {
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
  }

  create (data: UserData, params?: Params) {
    // This is the information we want from the user signup data
    const { nick, email, password, profile } = data;
    // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    // The full avatar URL
    const avatar = `${gravatarUrl}/${hash}?${query}`;
    // The complete user
    const userData = {
      nick,
      email,
      password,
      status: 0,
      state: 0,
      profile,
      created: new Date()
    };

    userData.profile.avatar = avatar
    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }
}
