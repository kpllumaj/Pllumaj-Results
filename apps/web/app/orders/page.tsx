"use client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  createdAt: string;
  need?: { title?: string; description?: string };
  offer?: { providerName?: string; price?: number; currency?: string };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:3001/orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  async function updateStatus(orderId: string, newStatus: string) {
    const confirmAction = window.confirm(
      `Are you sure you want to mark this order as ${newStatus}?`
    );
    if (!confirmAction) return;

    try {
      const res = await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert(`Order updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Failed to update order status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order.");
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading orders...</p>;

  // filter logic
  const filteredOrders = orders.filter((o) => {
    if (filter === "ACTIVE") return !["FULFILLED", "CANCELLED"].includes(o.status);
    if (filter === "COMPLETED") return o.status === "FULFILLED";
    if (filter === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        📦 My Orders
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b pb-2">
        {["ACTIVE", "COMPLETED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-t-md ${
              filter === tab
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab === "ACTIVE" && "Active"}
            {tab === "COMPLETED" && "Completed"}
            {tab === "CANCELLED" && "Cancelled"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No {filter.toLowerCase()} orders.</p>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-xl p-5 bg-white shadow-sm space-y-2"
          >
            <h2 className="text-xl font-semibold">
              {order.need?.title || "Untitled Need"}
            </h2>
            <p className="text-gray-600">
              {order.need?.description || "No description"}
            </p>
            <p>
              <strong>Offer:</strong> {order.offer?.price}{" "}
              {order.offer?.currency || "USD"}
            </p>
            <p>
              <strong>Provider:</strong> {order.offer?.providerName || "Unknown"}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p className="text-sm text-gray-500">
              Created: {new Date(order.createdAt).toLocaleString()}
            </p>

            {/* Actions */}
            {filter === "ACTIVE" && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => updateStatus(order.id, "FULFILLED")}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Completed
                </button>

                <button
                  onClick={() => updateStatus(order.id, "CANCELLED")}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* View Details */}
            <button
              onClick={() => (window.location.href = `/orders/${order.id}`)}
              className="mt-2 text-blue-600 underline hover:text-blue-800"
            >
              View Details →
            </button>
          </div>
        ))
      )}
    </section>
  );
}
