import { useEffect, useRef, useState } from 'react';

export function useWebSocket(path: string, enabled = true) {
  const base = (import.meta as unknown as { env?: { VITE_WS_BASE_URL?: string } }).env?.VITE_WS_BASE_URL;
  const url = base ? `${base}${path}` : undefined;
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<unknown[]>([]);

  useEffect(() => {
    if (!enabled || !url) return;
    let reconnectTimer: NodeJS.Timeout;
    const connect = () => {
      try {
        socketRef.current = new WebSocket(url);
        socketRef.current.onopen = () => setConnected(true);
        socketRef.current.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 1500);
        };
        socketRef.current.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            setMessages(prev => [...prev, data]);
          } catch {
            setMessages(prev => [...prev, evt.data]);
          }
        };
        socketRef.current.onerror = () => {
          socketRef.current?.close();
        };
      } catch {
        reconnectTimer = setTimeout(connect, 1500);
      }
    };
    connect();
    return () => {
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [url, enabled]);

  const send = (data: unknown) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return false;
    socketRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    return true;
  };

  return { connected, messages, send };
}


