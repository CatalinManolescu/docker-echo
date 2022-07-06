import EchoServer from './lib/server';

var process = require('process');

process.on('SIGINT', () => {
  console.info("Shutting down from SIGINT (Ctrl-C)");
  process.exit(0);
})

const server = new EchoServer();
server.start();
