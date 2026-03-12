
'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from "next/dynamic";
import Loading from './loading';
import Cookies from "js-cookie";
import './home.css';
import Pagelayout from './components/PageLayout';
import { IoPlay, IoPause, IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { Play, Pause, VolumeX, Volume } from "lucide-react";

/* ===========================
   🔥 LAZY LOAD COMPONENTS
=========================== */
const Bannerone = dynamic(() => import('./components/Bannerone'), { ssr: false });
const BannerToggle = dynamic(() => import('./components/BannerToggle'), { ssr: false });
const Bannergridwomens = dynamic(() => import('./components/Bannergridwomens'), { ssr: false });
const Bannertwo = dynamic(() => import('./components/Bannertwo'), { ssr: false });
const Stories = dynamic(() => import('./components/Stories'), { ssr: false });

interface BannersData {
  bannerOne?: any;
  bannerTwo?: any;
  [key: string]: any;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannersData>({});
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        /* ===========================
           ✅ FAST COOKIE HYDRATION
        =========================== */
        const cachedVideo = Cookies.get("hero_video");
        const cachedBanners = Cookies.get("home_banners");

        if (cachedVideo) setVideoUrl(cachedVideo);
        if (cachedBanners) setBanners(JSON.parse(cachedBanners));

        /* ===========================
           ✅ FETCH (ALLOW CACHE)
        =========================== */
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`,
          { next: { revalidate: 300 } } // 🔥 cache for 5 min
        );

        const data = await res.json();

        if (data?.heroVideoUrl) {
          setVideoUrl(data.heroVideoUrl);
          Cookies.set("hero_video", data.heroVideoUrl, { expires: 1 });
        }

        if (data?.banners) {
          setBanners(data.banners);
          Cookies.set("home_banners", JSON.stringify(data.banners), { expires: 1 });
        }
      } catch (err) {
        console.error("CMS fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSData();
  }, []);

  if (loading) return <Loading />;

  return (
    <Pagelayout>
      <>
        {/* ===========================
         🎥 HERO VIDEO (OPTIMIZED)
      =========================== */}
        <div className="hero-section">
          {videoUrl && (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
                className="hero-video"
              />

              {/* Controls */}
              <div className="video-controls">
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX size={18} /> : <Volume size={18} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ===========================
         🖼 BELOW THE FOLD (LAZY)
      =========================== */}
        <div className="banner-container banner-1">
          <Bannerone />
        </div>

        <div className="banner-container1 banner-toggle">
          <BannerToggle />
        </div>

        <div className="banner-container3">
          <Bannergridwomens />
        </div>

        <div className="banner-containe4 banner-2">
          <Bannertwo />
        </div>

        <div className="stories-section">
          <Stories />
        </div>
      </>
    </Pagelayout >
  );
}