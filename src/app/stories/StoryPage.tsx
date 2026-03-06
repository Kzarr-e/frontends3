"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "./StoryPage.css";
import PageLayout from "../components/PageLayout";

interface StoryStyle {
  titleFont?: string;
  bodyFont?: string;
  titleSize?: string;
  bodySize?: string;
  titleColor?: string;
  bodyColor?: string;
  lineHeight?: string;
  paragraphSpacing?: string;
  sectionSpacing?: string;
  textAlign?: "left" | "center" | "justify";
  maxWidth?: string;
  backgroundColor?: string;
}

interface Story {
  title: string;
  subtitle?: string;
  content: string;
  coverImage: string;
  images?: string[];
  style?: StoryStyle;
}

export default function StoryPage() {
  const { slug } = useParams();
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function loadStory() {
      try {
        const res = await fetch(`${API}/api/stories/${slug}`);
        const data = await res.json();
        setStory(data?.story || null);
      } catch (err) {
        console.error("Story load error:", err);
      }
    }

    loadStory();
  }, [slug, API]);

  if (!story) {
    return <div className="loading">Loading...</div>;
  }

  const images = story.images ?? [];

  return (
    <PageLayout>
      <article className="story-page">

        <div className="story-hero">
          <img src={story.coverImage} alt={story.title} />
        </div>

        <div className="story-container">
          <h1 className="story-title">{story.title}</h1>

          {story.subtitle && (
            <p className="story-subtitle">{story.subtitle}</p>
          )}

          <div
            className="story-content"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </div>

        {images.length > 0 && (
          <div className="story-gallery">
            {images.map((img, i) => (
              <img key={i} src={img} alt={`Story image ${i + 1}`} />
            ))}
          </div>
        )}

      </article>
    </PageLayout>
  );
}










