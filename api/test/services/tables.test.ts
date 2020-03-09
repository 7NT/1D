import assert from 'assert';
import app from '../../src/app';

describe('\'tables\' service', () => {
  it('registered the service', () => {
    const service = app.service('tables');

    assert.ok(service, 'Registered the service');
  });
});
