import * as authentication from '@feathersjs/authentication'
// Don't remove this comment. It's needed to format import lines nicely.
import { beforeSit, afterSit, logout } from '../../hooks/player'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [beforeSit()],
    remove: [logout()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [afterSit()],
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
