import assert from 'assert';
import app from '../../src/app';

describe('\'plyers\' service', () => {
  it('registered the service', () => {
    const service = app.service('plyers');

    assert.ok(service, 'Registered the service');
  });
});
