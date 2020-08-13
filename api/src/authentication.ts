import { ServiceAddons, Params, Query } from '@feathersjs/feathers'
import { AuthenticationService, JWTStrategy, AuthenticationRequest } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { expressOauth, OAuthStrategy, OAuthProfile } from '@feathersjs/authentication-oauth'

import axios from 'axios'
import { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>
  }
}

/*
class JbLocalStrategy extends LocalStrategy {
  async getEntityQuery(query: Query, params: Params) {
    // Query for use but only include `active` users
    return {
      ...query,
      status: { $gt: -2 },
      $limit: 1
    }
  }
}
*/
class GoogleStrategy extends OAuthStrategy {
  async getEntityData (profile: OAuthProfile, existing: any, params: Params) {
    console.log('google', profile)
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile, existing, params)
    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email
    }
  }
}

class FacebookStrategy extends OAuthStrategy {
  async getProfile (authResult: AuthenticationRequest, params: Params) {
    // This is the oAuth access token that can be used
    // for Facebook API requests as the Bearer token
    const accessToken = authResult.access_token

    const { data } = await axios.get('https://graph.facebook.com/me', {
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      params: {
        // There are
        fields: 'id,name,email'
      }
    })

    return data
  }

  async getEntityData (profile: OAuthProfile, existing: any, params: Params) {
    // `profile` is the data returned by getProfile
    const baseData = await super.getEntityData(profile, existing, params)
    return {
      ...baseData,
      nick: profile.email,
      email: profile.email,
      profile: {
        id: profile.id,
        social: 'facebook',
        name: profile.name,
        avatar: `http://graph.facebook.com/${profile.id}/picture`
      }
    }
  }
}

export default function (app: Application) {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  // authentication.register('local', new JbLocalStrategy());
  authentication.register('google', new GoogleStrategy())
  authentication.register('facebook', new FacebookStrategy())

  app.use('/authentication', authentication)
  app.configure(expressOauth())
}
