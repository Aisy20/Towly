import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WsServerMessage, Report } from '@townly/shared';
import { storage } from '../lib/storage';
import { reportKeys } from '../api/reports';
import { useReportStore } from '../store/reportStore';
import { haversineMeters } from '../lib/geo';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000';

/**
 * Live connection that PATCHES the normalized report store in place rather than
 * refetching the geo-window:
 *   • REPORT_CREATED      → upsert (only if inside the current radius)
 *   • REPORT_VOTE_UPDATED → patch vote tallies
 *   • REPORT_ARCHIVED     → mark archived (drops from map/list)
 *   • HELP/EVIDENCE       → bump count + invalidate the affected detail view
 *
 * The map and list re-derive from the store, so new nearby reports appear with
 * no full-screen refresh.
 */
export function useWebSocket(lat: number | null, lng: number | null, radiusMeters: number) {
  const ws = useRef<WebSocket | null>(null);
  const qc = useQueryClient();
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Keep the latest bounds in a ref so the message handler can radius-filter
  // without re-subscribing the socket on every change.
  const boundsRef = useRef({ lat, lng, radiusMeters });
  boundsRef.current = { lat, lng, radiusMeters };

  const handleMessage = useCallback(
    (msg: WsServerMessage) => {
      const store = useReportStore.getState();
      switch (msg.type) {
        case 'REPORT_CREATED': {
          const { lat: blat, lng: blng, radiusMeters: r } = boundsRef.current;
          if (blat !== null && blng !== null) {
            const d = haversineMeters(
              { lat: blat, lng: blng },
              { lat: msg.payload.latitude, lng: msg.payload.longitude },
            );
            if (d > r) return; // outside the window — ignore
          }
          store.upsertOne(msg.payload);
          break;
        }
        case 'REPORT_VOTE_UPDATED':
          store.patchVote(msg.payload.reportId, {
            netScore: msg.payload.netScore,
            upvotes: msg.payload.upvotes,
            downvotes: msg.payload.downvotes,
          });
          qc.setQueryData<Report>(reportKeys.detail(msg.payload.reportId), (old) =>
            old ? { ...old, ...msg.payload } : old,
          );
          break;
        case 'REPORT_ARCHIVED':
          store.archive(msg.payload.reportId, new Date().toISOString());
          break;
        case 'HELP_OFFERED':
          store.bumpCount(msg.payload.reportId, 'helpOffersCount');
          qc.invalidateQueries({ queryKey: reportKeys.helpThread(msg.payload.reportId) });
          qc.invalidateQueries({ queryKey: reportKeys.detail(msg.payload.reportId) });
          break;
        case 'EVIDENCE_ADDED':
          store.bumpCount(msg.payload.reportId, 'evidenceCount');
          qc.invalidateQueries({ queryKey: reportKeys.evidence(msg.payload.reportId) });
          qc.invalidateQueries({ queryKey: reportKeys.detail(msg.payload.reportId) });
          break;
      }
    },
    [qc],
  );

  const connect = useCallback(async () => {
    if (!mountedRef.current) return;

    const token = await storage.getItem('townly_access_token');
    const url = token ? `${WS_URL}/ws?token=${encodeURIComponent(token)}` : `${WS_URL}/ws`;

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      reconnectTimer.current = setTimeout(connect, 5000);
      return;
    }
    ws.current = socket;

    socket.onopen = () => {
      const { lat: blat, lng: blng, radiusMeters: r } = boundsRef.current;
      if (blat !== null && blng !== null) {
        socket.send(JSON.stringify({ type: 'SET_BOUNDS', payload: { lat: blat, lng: blng, radiusMeters: r } }));
      }
    };

    socket.onmessage = (event) => {
      try {
        handleMessage(JSON.parse(event.data as string) as WsServerMessage);
      } catch {
        /* ignore malformed frames */
      }
    };

    socket.onclose = () => {
      if (mountedRef.current) reconnectTimer.current = setTimeout(connect, 3000);
    };

    socket.onerror = () => socket.close();
  }, [handleMessage]);

  // Re-send bounds when the window changes (no reconnect).
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN && lat !== null && lng !== null) {
      ws.current.send(JSON.stringify({ type: 'SET_BOUNDS', payload: { lat, lng, radiusMeters } }));
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
  }, [connect]);
}
