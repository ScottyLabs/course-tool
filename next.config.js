const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => ({
  env: {
    backendUrl: phase === PHASE_DEVELOPMENT_SERVER ? 'http://localhost:3000' : 'https://beta.course.apis.scottylabs.org'
  },
})
