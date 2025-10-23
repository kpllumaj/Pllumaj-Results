"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusherClient";

type EventHandlers = Record<string, (payload: unknown) => void>;

export function useChannel(channelName: string | null | undefined, events: EventHandlers) {
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!channelName) {
      return;
    }

    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName);
    const boundHandlers = Object.entries(eventsRef.current).map(([eventName, handler]) => {
      channel.bind(eventName, handler);
      return { eventName, handler };
    });

    return () => {
      boundHandlers.forEach(({ eventName, handler }) => {
        channel.unbind(eventName, handler);
      });
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [channelName]);
}

