"use strict";
const Hapi = require("hapi");
const dotenv = require("dotenv");

dotenv.config({
  path: "./.env"
});

const server = Hapi.server({
  port: process.env.SERVER_PORT || 3000,
  host: process.env.SERVER_HOSTNAME || "localhost"
});

const load = () => {
  server.realm.modifiers.route.prefix = process.env.BASE_PATH || "/v1";
};

const init = async () => {
  load();
  await server.start();

  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();
