import crypto from 'crypto';
import { Params } from '@feathersjs/feathers';
import { Db } from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';

// A type interface for our user (it does not validate any data)
interface UserData {
  _id?: string;
  id?: string;
  nick: string,
  email: string;
  password: string;
  status: number;
  state: number;
  profile?: any;
  createdAt: number;
}

export class Users extends Service<UserData> {
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);

    const client: Promise<Db> = app.get('mongoClient');

    client.then(db => {
      this.Model = db.collection('users');
    });

  }

  create (data: UserData, params?: Params) {
    // This is the information we want from the user signup data
    const { nick, email, password, profile, id } = data;
    // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    // The full avatar URL
    const avatar = `${gravatarUrl}/${hash}?${query}`;
    // The complete user
    const userData = {
      id,
      nick,
      email,
      password,
      status: 0,
      state: 0,
      profile,
      createdAt: new Date().getTime()
    };

    userData.profile.avatar = avatar
    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }
}
