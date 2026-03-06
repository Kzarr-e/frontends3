// utils/trafficTracker.js

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const trackVisit = async () => {
  if (typeof window === "undefined") return;

  try {
    // Unique visitor ID
    let visitorId = localStorage.getItem("visitorId");

    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem("visitorId", visitorId);
    }

    const userId = localStorage.getItem("userId") || null;

    // 🔥 GET PUBLIC IP (works on localhost)
    let publicIP = null;
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipJson = await ipRes.json();
      publicIP = ipJson.ip;
    } catch {
      publicIP = null; // fallback
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        userId,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        publicIP, // 🔥 send public ip to backend
      }),
    });

  } catch (err) {
    console.error("Traffic tracking failed:", err);
  }
};
