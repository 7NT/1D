import assert from 'assert';
import app from '../../src/app';

describe('\'plays\' service', () => {
  it('registered the service', () => {
    const service = app.service('plays');

    assert.ok(service, 'Registered the service');
  });
});
