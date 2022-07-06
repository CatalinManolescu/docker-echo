import restify from 'restify';
import { logger } from './logger';
import { applicationConfig } from './config';

const errors = require('restify-errors');

class EchoServer {
  #port = 8123
  #server = null;

  constructor() {
    this._init()
  }

  _init() {
    const self = this;

    self.#server = restify.createServer({
      name: applicationConfig.application.name,
      version: applicationConfig.application.version
    });

    self.#port = applicationConfig.server.port;

    self.#server.use(restify.plugins.acceptParser(self.#server.acceptable));
    self.#server.use(restify.plugins.queryParser());
    self.#server.use(restify.plugins.bodyParser({ mapParams: true }));
    self.#server.use(restify.plugins.fullResponse());

    if (applicationConfig.server.throttle) {
      self.#server.use(restify.plugins.throttle(applicationConfig.server.throttle));
    }

    self.#server.pre(restify.plugins.pre.sanitizePath());
    self.#server.pre(restify.plugins.pre.userAgentConnection({ userAgentRegExp: /^curl.+/ }));

    self.#server.on('restifyError', function (req, res, err, callback) {
      err.toJSON = function customToJSON() {
        return {
          name: err.name,
          message: err.message
        };
      };
      err.toString = function customToString() {
        return err.message;
      };
      return callback();
    });

    self.#server.on('uncaughtException', function (req, res, route, err) {
      logger.error(err);
      res.send('server error');
    });

    self.#server.get("/health", function (req, res, next) {
      res.send(200);
    });

    self.#server.get("/version", function (req, res, next) {
      res.send(applicationConfig.application.version);
    });

    self.#server.get("/info", function (req, res, next) {
      res.send({
        name: applicationConfig.application.name,
        version: applicationConfig.application.version
      });
    });

    self.#server.get('/*', function (req, res, next) {
      return self._processRequest(req, res, next);
    });

    self.#server.post('/*', function (req, res, next) {
      return self._processRequest(req, res, next);
    });
  }

  _processRequest(req, res, next) {

    const self = this;
    let path = req.getPath();

    let timeLabel = null;
    if (process.env.NODE_DEBUG) {
      const logMsg = `${path}`
      logger.debug(logMsg);
      timeLabel = logger.time(logMsg);
    }

    logger.log(req.getPath());

    let msg = '';
    if (applicationConfig.options.includeDefaultMessage) {
      msg = `${applicationConfig.options.defaultMessage}\n`;
    }

    let reqData = self._parseRequestData(req);
    if ( Object.keys(reqData).length !== 0 ) {
      msg = msg + JSON.stringify(reqData) + '\n';
    }

    if (req.is('text') && req.body) {
      msg = msg + req.body;
    }

    logger.debug(req.getContentType())
    logger.debug(msg);

    res.send(msg);

    if (process.env.NODE_DEBUG) {
        logger.timeEnd(timeLabel);
    }

    return next();
  }

  _parseRequestData(req) {
    let requestData = { ...req.query, ...req.params };
    delete requestData['*'];

    return requestData;
  }

  start() {
    let server = this.#server;
    server.listen(this.#port, function () {
      console.log('%s listening at %s', server.name, server.url);
    });
  }
}

export default EchoServer;
