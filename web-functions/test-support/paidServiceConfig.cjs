const fs = require('node:fs');
const vm = require('node:vm');

// Evaluate the real frontend config with an isolated build environment.
module.exports = function paidServiceConfig(env = {}) {
  const source = fs.readFileSync(require.resolve('../../src/config/paidService.js'), 'utf8')
    .replaceAll('import.meta.env', 'ENV').replaceAll('export const ', 'const ');
  const scope = { ENV: env };
  vm.runInNewContext(source + '\nthis.result = {paidServiceMode, isPaidServiceLive};', scope);
  return scope.result;
};
