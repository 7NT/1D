import assert from 'assert';
import app from '../../src/app';

describe('\'tourneys\' service', () => {
  it('registered the service', () => {
    const service = app.service('tourneys');

    assert.ok(service, 'Registered the service');
  });
});
