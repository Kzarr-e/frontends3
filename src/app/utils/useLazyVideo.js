import { useEffect, useRef, useState } from "react";

export function useLazyVideo() {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true); // ✅ NOW load video
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // ✅ Start loading slightly before visible
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  return { videoRef, shouldLoad };
}
