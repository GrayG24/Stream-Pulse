import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage, StreamAlert } from '../types';

interface UseWebSocketOptions {
  channelId: string;
  userId: string;
  username: string;
  onChatMessage?: (message: ChatMessage) => void;
  onFollow?: (data: { followerName: string; theme: string; rewardTokens: number }) => void;
  onDonate?: (data: { donorName: string; amount: number; message?: string; theme: string }) => void;
  onReaction?: (data: { emoji: string; userId: string }) => void;
  onLiveState?: (data: { isLive: boolean; title?: string; category?: string }) => void;
  onVideoFrame?: (data: { frame: string; timestamp: number }) => void;
}

export function useWebSocket({
  channelId,
  userId,
  username,
  onChatMessage,
  onFollow,
  onDonate,
  onReaction,
  onLiveState,
  onVideoFrame,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(120);

  // Use refs for callbacks to avoid re-creating WebSocket on callback changes
  const callbacksRef = useRef({
    onChatMessage,
    onFollow,
    onDonate,
    onReaction,
    onLiveState,
    onVideoFrame,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChatMessage,
      onFollow,
      onDonate,
      onReaction,
      onLiveState,
      onVideoFrame,
    };
  }, [onChatMessage, onFollow, onDonate, onReaction, onLiveState, onVideoFrame]);

  useEffect(() => {
    if (!channelId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    let reconnectTimer: any = null;
    let isDisposed = false;
    let currentWs: WebSocket | null = null;

    // Optional cross-tab channel fallback
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(`streampulse_ch_${channelId}`);
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;
          if (data.type === 'chat_message') {
            callbacksRef.current.onChatMessage?.(data.message);
          } else if (data.type === 'follow') {
            callbacksRef.current.onFollow?.(data);
          } else if (data.type === 'donate') {
            callbacksRef.current.onDonate?.(data);
          } else if (data.type === 'reaction') {
            callbacksRef.current.onReaction?.(data);
          } else if (data.type === 'stream_live_state') {
            callbacksRef.current.onLiveState?.(data);
          }
        };
      }
    } catch {}

    function safeCloseWs(ws: WebSocket | null) {
      if (!ws) return;
      try {
        ws.onmessage = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          // Delay closing until open to prevent "WebSocket closed without opened" browser rejection
          ws.onopen = () => {
            try {
              ws.close();
            } catch {}
          };
          ws.onclose = null;
        }
      } catch {}
    }

    function connect() {
      if (isDisposed) return;
      try {
        const ws = new WebSocket(wsUrl);
        currentWs = ws;
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) {
            safeCloseWs(ws);
            return;
          }
          setIsConnected(true);
          try {
            ws.send(
              JSON.stringify({
                type: 'join_channel',
                channelId,
                userId,
                username,
              })
            );
          } catch {}
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'history') {
              if (Array.isArray(data.messages)) {
                data.messages.forEach((msg: ChatMessage) => {
                  callbacksRef.current.onChatMessage?.(msg);
                });
              }
            } else if (data.type === 'chat_message') {
              if (data.channelId === channelId) {
                callbacksRef.current.onChatMessage?.(data.message);
              }
            } else if (data.type === 'follow') {
              if (data.channelId === channelId) {
                callbacksRef.current.onFollow?.(data);
              }
            } else if (data.type === 'donate') {
              if (data.channelId === channelId) {
                callbacksRef.current.onDonate?.(data);
              }
            } else if (data.type === 'reaction') {
              if (data.channelId === channelId) {
                callbacksRef.current.onReaction?.(data);
              }
            } else if (data.type === 'stream_live_state') {
              if (data.channelId === channelId) {
                callbacksRef.current.onLiveState?.(data);
              }
            } else if (data.type === 'video_frame') {
              if (data.channelId === channelId) {
                callbacksRef.current.onVideoFrame?.(data);
              }
            }
          } catch {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (!isDisposed) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch {
        setIsConnected(false);
        if (!isDisposed) {
          reconnectTimer = setTimeout(connect, 4000);
        }
      }
    }

    connect();

    // Ping latency simulator/jitter estimator
    const pingInterval = setInterval(() => {
      const simulatedJitter = Math.floor(Math.random() * 40) + 90; // 90-130ms low latency
      setLatency(simulatedJitter);
    }, 4000);

    return () => {
      isDisposed = true;
      clearInterval(pingInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      safeCloseWs(currentWs);
      wsRef.current = null;
    };
  }, [channelId, userId, username]);

  const sendChatMessage = useCallback(
    (message: string, user: any, emotes: string[] = []) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat_message',
            channelId,
            user,
            message,
            emotes,
          })
        );
      }
    },
    [channelId]
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'reaction',
            channelId,
            emoji,
            userId,
          })
        );
      }
    },
    [channelId, userId]
  );

  const sendFollow = useCallback(
    (followerName: string, theme: string = 'purple-glow') => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'follow',
            channelId,
            followerName,
            theme,
          })
        );
      }
    },
    [channelId]
  );

  const sendDonate = useCallback(
    (donorName: string, amount: number, message: string = '', theme: string = 'golden-crown') => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'donate',
            channelId,
            donorName,
            amount,
            message,
            theme,
            userId,
          })
        );
      }
    },
    [channelId, userId]
  );

  const sendLiveState = useCallback(
    (isLive: boolean, title?: string, category?: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'stream_live_state',
            channelId,
            isLive,
            title,
            category,
          })
        );
      }
    },
    [channelId]
  );

  const sendVideoFrame = useCallback(
    (frameBase64: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'video_frame',
            channelId,
            frame: frameBase64,
          })
        );
      }
    },
    [channelId]
  );

  return {
    isConnected,
    latency,
    sendChatMessage,
    sendReaction,
    sendFollow,
    sendDonate,
    sendLiveState,
    sendVideoFrame,
  };
}
