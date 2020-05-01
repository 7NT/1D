// import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

// const { authenticate } = authentication.hooks;
import { onTable, onResult } from '../../hooks/table'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [ onTable() ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [onResult()],
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
