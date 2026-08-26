import { useLayoutEffect, useRef, useState } from "react";

const PAGE_WIDTH = 816;

function CoverLetterThumbnail({ children }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0.4);

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
    <div ref={frameRef} className="cover-letter-thumbnail-frame">
      <div
        className="cover-letter-thumbnail-page"
        style={{
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default CoverLetterThumbnail;