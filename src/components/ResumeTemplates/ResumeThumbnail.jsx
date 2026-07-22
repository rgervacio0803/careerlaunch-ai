import { useLayoutEffect, useRef, useState } from "react";

const PAGE_WIDTH = 794;

function ResumeThumbnail({ children, className = "" }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!frameRef.current) return;

      const frameWidth = frameRef.current.clientWidth;
      setScale(frameWidth / PAGE_WIDTH);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frameRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={`resume-thumbnail-frame ${className}`}
    >
      <div
        className="resume-thumbnail-page"
        style={{
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ResumeThumbnail;