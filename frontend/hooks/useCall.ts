"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { endCall, getCallDetail, getCalls, getContacts, getObserverWebSocketUrl, startOutboundCall } from "@/lib/api";
import type { CallSummary, Contact, TranscriptItem, WsMessage } from "@/types";


export function useCall(token: string | null) {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptItem[]>([]);
  const [partialMessage, setPartialMessage] = useState<string>("");
  const [callState, setCallState] = useState<string>("idle");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  async function refreshLists() {
    if (!token) {
      return;
    }
    const [callItems, contactItems] = await Promise.all([getCalls(token), getContacts(token)]);
    setCalls(callItems);
    setContacts(contactItems);
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshLists()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCallId) {
      setMessages([]);
      setPartialMessage("");
      return;
    }

    let cancelled = false;
    getCallDetail(token, selectedCallId)
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setMessages(detail.transcripts);
        setCallState(detail.status);
        setStartedAt(detail.started_at);
        if (detail.status !== "completed" && detail.status !== "failed") {
          setActiveCallId(detail.call_id);
        }
      })
      .catch((requestError: Error) => {
        if (!cancelled) {
          setError(requestError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCallId, token]);

  useEffect(() => {
    if (!token || !activeCallId) {
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const socket = new WebSocket(getObserverWebSocketUrl(activeCallId, token));
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WsMessage;
      switch (data.type) {
        case "call_state":
          setCallState(data.state);
          if (data.state === "completed") {
            setActiveCallId(null);
            refreshLists().catch(() => undefined);
          }
          break;
        case "agent_thinking":
          setCallState("thinking");
          break;
        case "partial_transcript":
          setPartialMessage(data.text);
          break;
        case "transcript":
          setPartialMessage("");
          setMessages((current: TranscriptItem[]) => [
            ...current,
            {
              speaker: data.speaker,
              text: data.text,
              timestamp: data.timestamp ?? new Date().toISOString(),
            },
          ]);
          break;
        case "error":
          setError(data.message);
          break;
      }
    };

    socket.onerror = () => {
      setError("Observer connection failed.");
    };

    const keepAlive = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 10000);

    return () => {
      window.clearInterval(keepAlive);
      socket.close();
      socketRef.current = null;
    };
  }, [activeCallId, token]);

  async function placeCall(toNumber: string, fromNumber: string) {
    if (!token) {
      return;
    }
    setError(null);
    const response = await startOutboundCall(token, { to_number: toNumber, from_number: fromNumber });
    setSelectedCallId(response.call_id);
    setActiveCallId(response.call_id);
    setMessages([]);
    setPartialMessage("");
    setCallState(response.status);
    setStartedAt(new Date().toISOString());
    await refreshLists();
  }

  async function hangUp(callId: string) {
    if (!token) {
      return;
    }
    await endCall(token, callId);
    setCallState("completed");
    setActiveCallId(null);
    await refreshLists();
  }

  const activeCall = useMemo(
    () => calls.find((item: CallSummary) => item.id === (activeCallId ?? selectedCallId)) ?? null,
    [activeCallId, calls, selectedCallId],
  );

  return {
    activeCall,
    activeCallId,
    callState,
    calls,
    contacts,
    error,
    loading,
    messages,
    partialMessage,
    placeCall,
    hangUp,
    refreshLists,
    selectedCallId,
    selectCall: setSelectedCallId,
    startedAt,
  };
}
