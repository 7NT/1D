import { Params } from '@feathersjs/feathers';
import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';

// A type interface for our user (it does not validate any data)
interface UserData {
  _id?: string;
  email: string;
  password?: string;
  name?: string;
  avatar?: string;
  locale?: string;
}

export class Users extends Service {
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
  }

  async create(data: UserData, params?: Params) {
    // This is the information we want from the user signup data
    const { name, email, password, avatar, locale } = data;

    // check if email already exists
    let users: any = await super.find({
      query: {
        $limit: 1,
        email,
        $sort: { created: -1 }
      }
    });

    if (users.data.length > 0) {
      // date avatar
      const date = {
        avatar,
        updatedAt: new Date().getTime()
      };
      return super.patch(users.data[0]._id, { avatar }, { query: { email } });
    } else {
      // Call the original `create` method with existing `params` and new data
      // return super.create(userData, params)
      // The complete user
      const userData = {
        name,
        email,
        password,
        avatar,
        locale
      };
      return super.create(userData, params);
    }

    // Call the original `create` method with existing `params` and new data
    // return super.create(userData, params)
    // return user;
  }
}
