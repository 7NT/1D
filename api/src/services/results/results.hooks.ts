import { onFind, onCreate, onUpdate } from '../../hooks/result'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [onCreate()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [onUpdate()],
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
