const webpackConfig = require('../test/webpack.js');
const ProcessService = require('../process/process');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config, url) {
    const debug = ProcessService(process).getArgument('DEBUG');

    return {
        basePath: '',
        frameworks: ['jasmine'],
        webpack: webpackConfig(debug),
        webpackMiddleware: {
            stats: 'errors-only'
        },
        files: [
            {
                pattern: url,
                watched: false
            }
        ],
        preprocessors: {
            [url]: ['webpack']
        },
        webpackServer: {
            noInfo: true
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        customLaunchers: {
            Chrome_no_sandbox: {
                base: 'Chrome',
                flags: ['--headless', '--no-sandbox']
            }
        },
        browsers: ['ChromeHeadless'],
        singleRun: true
    }

};
