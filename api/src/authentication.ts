import { ServiceAddons, Params, Query } from '@feathersjs/feathers'
import {
  AuthenticationService,
  JWTStrategy,
  AuthenticationRequest
} from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import {
  expressOauth,
  OAuthStrategy,
  OAuthProfile
} from '@feathersjs/authentication-oauth'

import axios from 'axios'
import { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService & ServiceAddons<any>
  }
}

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile, existing, params)
    console.log('g', profile, baseData)
    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      link: { provider: 'google', id: baseData.googleId },
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      locale: profile.locale
    }
  }
}

class FacebookStrategy extends OAuthStrategy {
  async getProfile(authResult: AuthenticationRequest, params: Params) {
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

  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    // `profile` is the data returned by getProfile
    const baseData = await super.getEntityData(profile, existing, params)
    console.log('f', profile, baseData)
    return {
      ...baseData,
      email: profile.email,
      name: profile.name,
      avatar: `http://graph.facebook.com/${profile.id}/picture`,
      locale: profile.locale || 'en'
    }
  }
}

class TwitterStrategy extends OAuthStrategy {
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    // this will set 'googleId'
    console.log('t', profile)
    const baseData = await super.getEntityData(profile, existing, params)
    console.log('t', baseData)
    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      link: { provider: 'facebook', id: baseData.id },
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      locale: profile.locale
    }
  }
}

export default function (app: Application) {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  authentication.register('google', new GoogleStrategy())
  authentication.register('facebook', new FacebookStrategy())
  authentication.register('twitter', new TwitterStrategy())

  app.use('/authentication', authentication)
  app.configure(expressOauth())
}
