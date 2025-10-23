import Pusher from "pusher";

const requiredEnvVars = ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(`[offers] Missing ${key} environment variable; Pusher events will fail.`);
  }
}

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.PUSHER_CLUSTER ?? "us2",
  useTLS: true,
});
