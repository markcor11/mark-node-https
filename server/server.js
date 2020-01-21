require('appmetrics-dash').attach();
const { promisify } = require('util');

main().catch(err => console.dir(err));

async function main() {

  const appName = require('./../package').name;
  const http = require('http');
  const express = require('express');
  const log4js = require('log4js');
  const localConfig = require('./config/local.json');
  const path = require('path');
  const logger = log4js.getLogger(appName);
  logger.level = process.env.LOG_LEVEL || 'info'
  const app = express();

  const port = process.env.PORT || localConfig.port;
  const https = require('https');
  const pem = require('pem');
  const createCertificateAsync = promisify(pem.createCertificate);
  let keys = await createCertificateAsync({ selfSigned: true });
  const server = https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app)
  require('./routers/index')(app, server);
  app.use(log4js.connectLogger(logger, { level: logger.level }));


  // Add your code here



  server.listen(port, function () {
    logger.info(`node listening on http://localhost:${port}`);
  });

  app.use(function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public', '404.html'));
  });

  app.use(function (err, req, res, next) {
    res.sendFile(path.join(__dirname, '../public', '500.html'));
  });

  module.exports = server;

}