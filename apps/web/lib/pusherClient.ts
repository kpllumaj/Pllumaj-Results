"use client";

import Pusher from "pusher-js";

let client: Pusher | null = null;

export function getPusherClient() {
  if (client) {
    return client;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error("Pusher environment variables are not configured");
  }

  client = new Pusher(key, {
    cluster,
    forceTLS: true,
  });

  return client;
}
