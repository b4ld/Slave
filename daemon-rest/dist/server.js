'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const Hapi = __importStar(require('hapi'));
const DotEnv = __importStar(require('dotenv'));
const logger_1 = __importDefault(require('./helper/logger'));
const router_1 = __importDefault(require('./router'));
const plugin_1 = __importDefault(require('./plugin'));
class Server {
  static start() {
    return __awaiter(this, void 0, void 0, function*() {
      try {
        DotEnv.config({
          path: `${process.cwd()}/.env`,
        });
        Server._instance = new Hapi.Server({
          port: process.env.PORT,
        });
        yield plugin_1.default.registerAll(Server._instance);
        yield router_1.default.loadRoutes(Server._instance);
        yield Server._instance.start();
        logger_1.default.info('Server - Up and running!');
        logger_1.default.info(
          `Visit: http://${process.env.HOST}:${
            process.env.PORT
          }/api for REST API`
        );
        logger_1.default.info(
          `Visit: http://${process.env.HOST}:${
            process.env.PORT
          }/documentation for Swagger docs`
        );
        return Server._instance;
      } catch (error) {
        logger_1.default.info(`Server - There was something wrong: ${error}`);
        throw error;
      }
    });
  }
  static stop() {
    logger_1.default.info(`Server - Stopping!`);
    return Server._instance.stop();
  }
  static recycle() {
    return __awaiter(this, void 0, void 0, function*() {
      yield Server.stop();
      return yield Server.start();
    });
  }
  static instance() {
    return Server._instance;
  }
  static inject(options) {
    return __awaiter(this, void 0, void 0, function*() {
      return yield Server._instance.inject(options);
    });
  }
}
exports.default = Server;
//# sourceMappingURL=server.js.map
