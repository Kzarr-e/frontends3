"use client";

import { useEffect, useState } from "react";
import "./about.css";
import PageLayout from "../components/PageLayout";
type AboutGridItem = {
  text?: string;
  images?: string[];
};

type AboutData = {
  heroVideo?: string;
  content: {
    quote: {
      text: string;
      highlight: string;
    };
    intro: string;
    body: string;
  };
  grid?: AboutGridItem[];
  footer: {
    text: string;
    heading: string;
  };
};

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public/about`
    )
      .then((res) => res.json())
      .then((data) => setAbout(data.about));
  }, []);

  if (!about) return null;

  const firstBlock = about.grid?.[0];
  const secondBlock = about.grid?.[1];

  return (
    <PageLayout>
    <div className="about-container">
      {/* ========== HERO VIDEO ========== */}
      {about.heroVideo && (
        <section className="hero-section">
          <video
            className="hero-video"
            src={about.heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </section>
      )}

      {/* ========== QUOTE + INTRO ========== */}
      <section className="about-content">
        <p className="quote">
          {about.content.quote.text}
          <span> “{about.content.quote.highlight}” </span>
        </p>
        <p className="intro">{about.content.intro}</p>
      </section>

      {/* ========== IMAGE RIGHT + TEXT LEFT ========== */}
      {firstBlock && (
        <section className="image-grid">
          <div className="image-text">
            {/* TEXT */}
            <p style={{ order: 1 }}>{firstBlock.text}</p>

            {/* IMAGE */}
            {firstBlock.images?.[0] && (
              <img
                src={firstBlock.images[0]}
                alt="About visual 1"
                style={{ order: 2 }}
              />
            )}
          </div>
        </section>
      )}

      {/* ========== IMAGE LEFT + TEXT RIGHT ========== */}
      {secondBlock && (
        <section className="image-grid">
          <div className="image-text">
            {/* IMAGE */}
            {secondBlock.images?.[0] && (
              <img
                src={secondBlock.images[0]}
                alt="About visual 2"
                style={{ order: 1 }}
              />
            )}

            {/* TEXT */}
            <p style={{ order: 2 }}>{secondBlock.text}</p>
          </div>
        </section>
      )}

      {/* ========== BODY TEXT ========== */}
      <section className="about-content">
        <p className="text-block">{about.content.body}</p>
      </section>

      {/* ========== FOOTER ========== */}
      <section className="about-footer">
        <p>{about.footer.text}</p>
        <h3>{about.footer.heading}</h3>
      </section>
    </div>
    </PageLayout>
  );
}
