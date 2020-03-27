import assert from 'assert';
import app from '../../src/app';

describe('\'played\' service', () => {
  it('registered the service', () => {
    const service = app.service('played');

    assert.ok(service, 'Registered the service');
  });
});
