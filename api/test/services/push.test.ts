import assert from 'assert';
import app from '../../src/app';

describe('\'push\' service', () => {
  it('registered the service', () => {
    const service = app.service('push');

    assert.ok(service, 'Registered the service');
  });
});
