import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;
import { createdAt, pairUp } from '../../hooks/tourneys'

export default {
  before: {
    all: [authenticate('jwt')],
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
