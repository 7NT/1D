import crypto from 'crypto'
import { Params } from '@feathersjs/feathers'
import { Service, MongooseServiceOptions } from 'feathers-mongoose'
import { Application } from '../../declarations'

// A type interface for our user (it does not validate any data)
interface UserData {
  _id?: string
  id?: string
  nick?: string
  email: string
  password?: string
  name?: string
  avatar?: string
  country?: string
  flag?: string
  locale?: string,
  link?: {
    provider: string,
    id: string
  }
}

export class Users extends Service {
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options)
  }

  async create(data: UserData, params?: Params) {
    // This is the information we want from the user signup data    
    const { nick, name, email, password, country, flag, avatar, locale, link } = data

    // check if email already exists
    let users: any = await super.find({
      query: {
        $limit: 1,
        email,
        $sort: { created: -1 }
      }
    })

    if (users.data.length > 0) {
      // date avatar
      const date = {
        avatar,
        name,
        link,
        updatedAt: new Date().getTime()
      }
      // console.log('update', users, data)
      return super.patch(users.data[0]._id, data)
    } else {
      const userData = {
        nick,
        name,
        email,
        password,
        avatar,
        country,
        flag,
        locale,
        link
      }
      if (!avatar) {
        // The Gravatar image service
        const gravatarUrl = 'https://s.gravatar.com/avatar'
        // The size query. Our chat needs 60px images
        const query = 's=60'
        // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
        const hash = crypto
          .createHash('md5')
          .update(email.toLowerCase())
          .digest('hex')
        // The full avatar URL
        userData.avatar = `${gravatarUrl}/${hash}?${query}`
      }
      // Call the original `create` method with existing `params` and new data
      // return super.create(userData, params)
      // The complete user
      // console.log('create', userData)
      return super.create(userData, params)
    }

    // Call the original `create` method with existing `params` and new data
    // return super.create(userData, params)
  }
}
