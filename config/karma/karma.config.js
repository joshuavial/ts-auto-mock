const karmaBaseConfig = require('./karma.config.base');

module.exports = function(config) {
    const karmaConfig = karmaBaseConfig(config, '../../test/transformer/**/reuse.test.ts');

    config.set(karmaConfig);
};