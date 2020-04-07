// import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

// const { authenticate } = authentication.hooks;
import { state } from '../../hooks/update-table'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [ state() ],
    remove: []
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
