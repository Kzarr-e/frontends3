'use client';

import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import Loading from '../loading';
import Cookies from "js-cookie";
import './home.css';
import Pagelayout from '../components/PageLayout';
/* ===========================
   🔥 LAZY LOAD COMPONENTS
=========================== */
const Bannerone = dynamic(() => import('../components/Bannerone'), { ssr: false });
const BannerToggle = dynamic(() => import('../components/BannerToggle'), { ssr: false });
const Bannergridwomens = dynamic(() => import('../components/Bannergridwomens'), { ssr: false });
const Bannertwo = dynamic(() => import('../components/Bannertwo'), { ssr: false });
const Stories = dynamic(() => import('../components/Stories'), { ssr: false });

interface BannersData {
  bannerOne?: any;
  bannerTwo?: any;
  [key: string]: any;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannersData>({});
  const [loading, setLoading] = useState(true);

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
      <section className="hero-section">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"        // ✅ HUGE FIX
            poster="/placeholder.png" // ✅ prevents blank screen
            className="hero-video"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="no-video">
            <p>No approved video available.</p>
          </div>
        )}
      </section>

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
    </Pagelayout>
  );
}