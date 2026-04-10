import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WsServerMessage, Report } from '@townly/shared';
import { storage } from '../lib/storage';
import { reportKeys } from '../api/reports';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000';

export function useWebSocket(lat: number | null, lng: number | null, radiusMeters: number) {
  const ws = useRef<WebSocket | null>(null);
  const qc = useQueryClient();
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(async () => {
    if (!mountedRef.current) return;

    const token = await storage.getItem('townly_access_token');
    const url = token ? `${WS_URL}/ws?token=${encodeURIComponent(token)}` : `${WS_URL}/ws`;

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      // WebSocket connection failed (e.g. no backend in dev) — retry silently
      reconnectTimer.current = setTimeout(connect, 5000);
      return;
    }
    ws.current = socket;

    socket.onopen = () => {
      if (lat !== null && lng !== null) {
        socket.send(
          JSON.stringify({ type: 'SET_BOUNDS', payload: { lat, lng, radiusMeters } }),
        );
      }
    };

    socket.onmessage = (event) => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data as string);
        handleMessage(msg);
      } catch {}
    };

    socket.onclose = () => {
      if (mountedRef.current) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [lat, lng, radiusMeters]);

  function handleMessage(msg: WsServerMessage) {
    if (msg.type === 'REPORT_CREATED') {
      qc.setQueriesData<{ reports: Report[]; nextCursor: string | null }>(
        { queryKey: reportKeys.all },
        (old) => {
          if (!old) return old;
          return { ...old, reports: [msg.payload, ...old.reports] };
        },
      );
    } else if (msg.type === 'REPORT_VOTE_UPDATED') {
      qc.setQueryData<Report>(reportKeys.detail(msg.payload.reportId), (old) => {
        if (!old) return old;
        return { ...old, ...msg.payload };
      });
    } else if (msg.type === 'REPORT_ARCHIVED') {
      qc.setQueriesData<{ reports: Report[]; nextCursor: string | null }>(
        { queryKey: reportKeys.all },
        (old) => {
          if (!old) return old;
          return { ...old, reports: old.reports.filter((r) => r.id !== msg.payload.reportId) };
        },
      );
    }
  }

  // Update bounds when location/radius changes
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN && lat !== null && lng !== null) {
      ws.current.send(
        JSON.stringify({ type: 'SET_BOUNDS', payload: { lat, lng, radiusMeters } }),
      );
    }
  }, [lat, lng, radiusMeters]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, []);
}
