import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

import { createdAt, pairUp } from '../../hooks/tourneys'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [createdAt()],
    update: [],
    patch: [pairUp()],
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
