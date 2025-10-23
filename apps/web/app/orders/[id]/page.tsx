"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; email: string };
}

export default function OrderChatPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [senderId] = useState("cmgw630o60002cmi1zwt1tjum"); // demo user
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Fetch chat history
  async function fetchMessages() {
    try {
      const res = await fetch(`http://localhost:3001/orders/${orderId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  }

  // Send a new message
  async function sendMessage() {
    if (!text.trim()) return;
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, text }),
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  // Typing indicator
  async function sendTyping(isTyping: boolean) {
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, isTyping }),
      });
    } catch (err) {
      console.error("Error sending typing event:", err);
    }
  }

  // Realtime subscription + message load
  useEffect(() => {
    let initialized = false;
    if (initialized) return;
    initialized = true;

    let mounted = true;

    const loadMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/orders/${orderId}/messages`);
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setMessages(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        if (mounted) setLoading(false);
      }
    };

    loadMessages();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`order-${orderId}`);

    channel.bind("new-message", (msg: Message) => {
      if (mounted) setMessages((prev) => [...prev, msg]);
    });

    channel.bind("typing", (data: { senderId: string; isTyping: boolean }) => {
      if (!mounted || data.senderId === senderId) return;
      setTypingUser(data.isTyping ? "Someone is typing..." : null);
    });

    return () => {
      mounted = false;
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [orderId, senderId]);

  if (loading) return <p className="p-6 text-gray-500">Loading chat...</p>;

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">💬 Order Chat</h1>

      <div className="border rounded-xl bg-white p-4 h-[400px] overflow-y-auto shadow-sm">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              <p className="text-sm text-gray-600">
                <strong>{msg.sender.email}</strong>
              </p>
              <p className="bg-gray-100 inline-block px-3 py-2 rounded-lg">
                {msg.text}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
        {typingUser && <p className="text-sm italic text-gray-400">{typingUser}</p>}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping(true);
            setTimeout(() => sendTyping(false), 1000);
          }}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </section>
  );
}
