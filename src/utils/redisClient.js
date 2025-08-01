const redis = require('redis');
// const client = redis.createClient(); // default: localhost:6379

const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 5000
  }
});

client.on('error', (err) => console.error('Redis Error:', err));
client.on('connect', () => console.log('Redis connected ✅'));

client.connect();

module.exports = client;
