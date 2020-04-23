// import * as authentication from '@feathersjs/authentication'
// Don't remove this comment. It's needed to format import lines nicely.
import { status, logout } from '../../hooks/player'

// const { authenticate } = authentication.hooks

export default {
  before: {
    all: [], // all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [status()],
    remove: [logout()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
