import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

import { onTable, onState } from '../../hooks/table'

// const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [],  // [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [onTable()],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [onState()],
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
