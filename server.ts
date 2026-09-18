import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json());

// In-memory channel states & chat messages history
interface ChatStoreItem {
  id: string;
  channelId: string;
  user: {
    id: string;
    name: string;
    color: string;
    badges: any[];
  };
  message: string;
  timestamp: number;
  type: string;
  donationAmount?: number;
  emotes?: string[];
}

const chatHistoryByChannel: Record<string, ChatStoreItem[]> = {};

// WebSocket setup
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientInfo {
  ws: WebSocket;
  channelId: string;
  userId: string;
  username: string;
}

const clients = new Set<ClientInfo>();

function broadcastToChannel(channelId: string, data: any, senderWs?: WebSocket) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.channelId === channelId && client.ws.readyState === WebSocket.OPEN) {
      // Broadcast to everyone in channel
      client.ws.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  let clientInfo: ClientInfo = {
    ws,
    channelId: '',
    userId: '',
    username: 'Guest',
  };
  clients.add(clientInfo);

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());

      if (data.type === 'join_channel') {
        clientInfo.channelId = data.channelId;
        clientInfo.userId = data.userId || 'anon';
        clientInfo.username = data.username || 'Viewer';

        // Send existing history
        const history = chatHistoryByChannel[data.channelId] || [];
        ws.send(
          JSON.stringify({
            type: 'history',
            channelId: data.channelId,
            messages: history,
          })
        );
      } else if (data.type === 'chat_message') {
        const chatItem: ChatStoreItem = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          channelId: data.channelId,
          user: data.user,
          message: data.message,
          timestamp: Date.now(),
          type: data.messageType || 'chat',
          donationAmount: data.donationAmount,
          emotes: data.emotes,
        };

        if (!chatHistoryByChannel[data.channelId]) {
          chatHistoryByChannel[data.channelId] = [];
        }
        chatHistoryByChannel[data.channelId].push(chatItem);
        // Keep last 100 messages
        if (chatHistoryByChannel[data.channelId].length > 100) {
          chatHistoryByChannel[data.channelId].shift();
        }

        broadcastToChannel(data.channelId, {
          type: 'chat_message',
          channelId: data.channelId,
          message: chatItem,
        });
      } else if (data.type === 'reaction') {
        // High speed reaction burst (floating hearts/flames)
        broadcastToChannel(data.channelId, {
          type: 'reaction',
          channelId: data.channelId,
          emoji: data.emoji,
          userId: data.userId,
        });
      } else if (data.type === 'follow') {
        // Follow alert + token bounty for streamer
        broadcastToChannel(data.channelId, {
          type: 'follow',
          channelId: data.channelId,
          followerName: data.followerName,
          theme: data.theme || 'purple-glow',
          rewardTokens: 25,
        });

        // Add system event message in chat
        const sysMsg: ChatStoreItem = {
          id: 'sys_' + Date.now(),
          channelId: data.channelId,
          user: { id: 'sys', name: 'StreamBot', color: '#9146FF', badges: [{ id: 'bot', name: 'Bot', color: '#9146FF', iconType: 'bot' }] },
          message: `🎉 ${data.followerName} just followed the channel! Streamer earned +25 Tokens bounty!`,
          timestamp: Date.now(),
          type: 'follow',
        };
        if (!chatHistoryByChannel[data.channelId]) {
          chatHistoryByChannel[data.channelId] = [];
        }
        chatHistoryByChannel[data.channelId].push(sysMsg);
        broadcastToChannel(data.channelId, {
          type: 'chat_message',
          channelId: data.channelId,
          message: sysMsg,
        });
      } else if (data.type === 'donate') {
        // Token donation with alert sound and visual
        broadcastToChannel(data.channelId, {
          type: 'donate',
          channelId: data.channelId,
          donorName: data.donorName,
          amount: data.amount,
          message: data.message,
          theme: data.theme || 'golden-crown',
        });

        const tipMsg: ChatStoreItem = {
          id: 'tip_' + Date.now(),
          channelId: data.channelId,
          user: { id: data.userId, name: data.donorName, color: '#FFB800', badges: [{ id: 'vip', name: 'Donor', color: '#FFB800', iconType: 'diamond' }] },
          message: `💎 Cheered ${data.amount} Tokens! ${data.message ? `"${data.message}"` : ''}`,
          timestamp: Date.now(),
          type: 'donation',
          donationAmount: data.amount,
        };
        if (!chatHistoryByChannel[data.channelId]) {
          chatHistoryByChannel[data.channelId] = [];
        }
        chatHistoryByChannel[data.channelId].push(tipMsg);
        broadcastToChannel(data.channelId, {
          type: 'chat_message',
          channelId: data.channelId,
          message: tipMsg,
        });
      } else if (data.type === 'stream_live_state') {
        // Broadcaster went live or ended live
        broadcastToChannel(data.channelId, {
          type: 'stream_live_state',
          channelId: data.channelId,
          isLive: data.isLive,
          title: data.title,
          category: data.category,
        });
      } else if (data.type === 'video_frame') {
        // Low latency video frame sync for multi-tab broadcaster viewing
        broadcastToChannel(data.channelId, {
          type: 'video_frame',
          channelId: data.channelId,
          frame: data.frame,
          timestamp: Date.now(),
        }, ws);
      }
    } catch (err) {
      console.error('WS parse error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(clientInfo);
  });
});

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: clients.size,
    timestamp: Date.now(),
  });
});

app.get('/api/chat/:channelId', (req, res) => {
  const history = chatHistoryByChannel[req.params.channelId] || [];
  res.json({ channelId: req.params.channelId, messages: history });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Twitch-like streaming server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
