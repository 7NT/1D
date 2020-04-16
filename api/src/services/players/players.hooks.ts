import * as authentication from '@feathersjs/authentication'
// Don't remove this comment. It's needed to format import lines nicely.
import { sitBefore, sitAfter, logout } from '../../hooks/player'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [sitBefore()],
    remove: [logout()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [sitAfter()],
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
