import assert from 'assert';
import app from '../../src/app';

describe('\'Tourneys\' service', () => {
  it('registered the service', () => {
    const service = app.service('tourneys');

    assert.ok(service, 'Registered the service');
  });
});
