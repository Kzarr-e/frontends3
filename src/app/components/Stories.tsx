"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./Stories.css";

/* ================= TYPES ================= */
interface Story {
  _id: string;
  title: string;
  subtitle?: string;
  coverImage: string;
  slug: string;
}

/* ================= COMPONENT ================= */
export default function StoriesSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isInteracting = useRef(false);

  const [stories, setStories] = useState<Story[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    async function loadStories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/stories`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          console.error("Stories API failed:", res.status);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data?.stories)) {
          setStories(
            data.stories.filter(
              (s: Story) => s.slug && s.coverImage && s.title
            )
          );
        }
      } catch (err) {
        console.error("Failed to load stories:", err);
      }
    }

    loadStories();
  }, []);

  /* ================= CENTER DETECTION ================= */
  const detectCenter = () => {
    const container = containerRef.current;
    if (!container) return;

    const center = container.scrollLeft + container.clientWidth / 2;
    const cards = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(".story-card")
    );

    let bestIndex = 0;
    let bestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActiveIndex(bestIndex);
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || stories.length === 0) return;

    let direction = 1;
    const speed = 0.4;

    const loop = () => {
      if (!isInteracting.current) {
        container.scrollLeft += speed * direction;

        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 2
        ) {
          direction = -1;
        } else if (container.scrollLeft <= 0) {
          direction = 1;
        }

        detectCenter();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stories]);

  /* ================= PAUSE ON INTERACTION ================= */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pause = () => (isInteracting.current = true);
    const resume = () =>
      setTimeout(() => (isInteracting.current = false), 500);

    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);
    container.addEventListener("mousedown", pause);
    container.addEventListener("mouseup", resume);
    container.addEventListener("mouseleave", resume);

    return () => {
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
      container.removeEventListener("mousedown", pause);
      container.removeEventListener("mouseup", resume);
      container.removeEventListener("mouseleave", resume);
    };
  }, []);

  if (stories.length === 0) return null;

  return (
    <> <h2 className="stories-title">Stories</h2>
    <section className="stories-sectioni">
      

      <div ref={containerRef} className="stories-scroll">
        <div className="stories-grid">
          {stories.map((story, index) => (
            <Link
              key={story._id}
              href={`/stories/${story.slug}`}
              className={`story-card ${index === activeIndex ? "active" : ""
                }`}
            >
              <img
                className="story-img"
                src={story.coverImage}
                alt={story.title}
                draggable={false}
              />
              <h3>
                {story.title.length > 48
                  ? story.title.slice(0, 48) + ""
                  : story.title}
              </h3>

              {story.subtitle && (
                <p>
                  {story.subtitle.length > 70
                    ? story.subtitle.slice(0, 70) + ""
                    : story.subtitle}
                </p>
              )}

            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
