const withTM = require("next-transpile-modules")(["passlink"]);
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase, defaultConfig) =>
  withTM({
    env: {
      backendUrl:
        phase === PHASE_DEVELOPMENT_SERVER
          ? "http://localhost:3000"
          : "https://course-tool-backend-2kh6wuzobq-uc.a.run.app",
    },
  });
