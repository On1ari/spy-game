import { GameWebSocketServer } from './websocket-server';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

const server = new GameWebSocketServer(PORT);

console.log(`
🎮 Spy Game Server
==================
WebSocket Server running on port ${PORT}
Ready to accept connections!
`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close();
  process.exit(0);
});
