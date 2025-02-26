const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let streamer = null;
let viewer = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'streamer') {
      streamer = ws;
      console.log('Streamer connected');
    } else if (data.type === 'viewer') {
      viewer = ws;
      console.log('Viewer connected');
      if (streamer) {
        streamer.send(JSON.stringify({ type: 'offer', sdp: data.sdp }));
      }
    } else if (data.type === 'answer') {
      if (streamer) {
        streamer.send(JSON.stringify({ type: 'answer', sdp: data.sdp }));
      }
    } else if (data.type === 'iceCandidate') {
      const target = data.target === 'streamer' ? streamer : viewer;
      if (target) {
        target.send(JSON.stringify({ type: 'iceCandidate', candidate: data.candidate }));
      }
    }
  });

  ws.on('close', () => {
    if (ws === streamer) streamer = null;
    if (ws === viewer) viewer = null;
  });
});

console.log('Signaling server running on ws://localhost:8080');