"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./maintenance.module.css";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function MaintenancePage() {
  const router = useRouter();

  const [eta, setEta] = useState<string | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Our website is currently undergoing scheduled maintenance."
  );

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const [progress, setProgress] = useState(0);

  /* =====================
     CHECK MAINTENANCE
  ===================== */

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/admin/system`, {
          cache: "no-store",
        });

        const data = await res.json();

        const m = data?.config?.maintenance;

        if (!m) return;

        if (!m.maintenanceMode) {
          router.replace("/");
          return;
        }

        if (m.maintenanceMessage) {
          setMaintenanceMessage(m.maintenanceMessage);
        }

        if (m.maintenanceEta) {
          setEta(m.maintenanceEta);
        }
      } catch {
        console.warn("Maintenance check failed");
      }
    };

    check();

    const interval = setInterval(check, 5000);

    return () => clearInterval(interval);
  }, [router]);

  /* =====================
     COUNTDOWN + PROGRESS
  ===================== */

  useEffect(() => {
    if (!eta) return;

    const target = new Date(eta).getTime();
    const start = Date.now();

    const update = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        setProgress(100);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });

      const total = target - start;
      const elapsed = now - start;

      const pct = Math.min(100, (elapsed / total) * 100);

      setProgress(pct);
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [eta]);

  /* =====================
     DATE FORMAT
  ===================== */

  const formattedDate = eta
    ? new Date(eta).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/New_York",
    })
    : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Logo */}
        <Image
          src="/Asset/logo.png"
          alt="KZARRĒ"
          width={280}
          height={60}
          priority
        />

        <h1 className={styles.title}>We’ll Be Back Soon</h1>

        <p className={styles.subtitle}>{maintenanceMessage}</p>

        <div className={styles.divider} />

        {formattedDate && (
          <p className={styles.restoreTime}>
            Estimated Restore: <strong>{formattedDate}</strong>
          </p>
        )}

        {/* FLIP COUNTDOWN */}
        <div className={styles.countdown}>
          <Flip label="Days" value={timeLeft.days} />
          <Flip label="Hours" value={timeLeft.hours} />
          <Flip label="Minutes" value={timeLeft.minutes} />
          <Flip label="Seconds" value={timeLeft.seconds} />
        </div>

        {/* PROGRESS BAR */}
        <div className={styles.progressWrapper}>
          <div
            className={styles.progress}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles.footer}>
          © {new Date().getFullYear()} KZARRĒ
        </div>
      </div>
    </div>
  );
}

/* =====================
   FLIP COMPONENT
===================== */

function Flip({ value, label }: any) {
  const [current, setCurrent] = useState(value);
  const [next, setNext] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== current) {
      setNext(value);
      setFlipping(true);

      const timeout = setTimeout(() => {
        setCurrent(value);
        setFlipping(false);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [value, current]);

  return (
    <div className={styles.flipBox}>
      <div className={styles.flipClock}>
        
        {/* STATIC TOP */}
        <div className={styles.top}>{current}</div>

        {/* STATIC BOTTOM */}
        {/* <div className={styles.bottom}>{next}</div> */}

        {flipping && (
          <>
            {/* TOP FLIP */}
            <div className={styles.topFlip}>{next}</div>

            {/* BOTTOM FLIP */}
            {/* <div className={styles.topFlip}>{next}</div> */}
          </>
        )}
      </div>

      <span className={styles.label}>{label}</span>
    </div>
  );
}