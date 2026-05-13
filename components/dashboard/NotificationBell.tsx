"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "idle" | "loading" | "subscribed" | "denied" | "unsupported";

export function NotificationBell() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setStatus("subscribed");
      });
    });
  }, []);

  async function registerSW() {
    return navigator.serviceWorker.register("/sw.js");
  }

  async function subscribe() {
    setStatus("loading");
    try {
      const reg = await registerSW();
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("[NotificationBell] subscribe error:", err);
      setStatus("idle");
    }
  }

  async function unsubscribe() {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("idle");
    } catch {
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") return null;

  const label =
    status === "subscribed"
      ? "Notifications ON — click to disable"
      : status === "denied"
      ? "Notifications blocked in browser settings"
      : "Enable birthday notifications";

  return (
    <Button
      id="notification-bell-btn"
      variant="outline"
      size="icon"
      onClick={status === "subscribed" ? unsubscribe : subscribe}
      disabled={status === "loading" || status === "denied"}
      title={label}
      aria-label={label}
      className={
        status === "subscribed"
          ? "border-violet-500 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950"
          : status === "denied"
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    >
      {status === "subscribed" ? (
        <BellRing className="h-4 w-4" />
      ) : status === "denied" ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
    </Button>
  );
}
