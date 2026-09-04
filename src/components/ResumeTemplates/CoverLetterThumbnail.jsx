import { useLayoutEffect, useRef, useState } from "react";

const PAGE_WIDTH = 816;

function CoverLetterThumbnail({ children }) {
  const frameRef = useRef(null);
  const pageRef = useRef(null);

  const [scale, setScale] = useState(0.4);
  const [frameHeight, setFrameHeight] = useState(null);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!frameRef.current || !pageRef.current) return;

      const frameWidth = frameRef.current.clientWidth;
      const newScale = frameWidth / PAGE_WIDTH;
      const pageHeight = pageRef.current.scrollHeight;

      setScale(newScale);
      setFrameHeight(pageHeight * newScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frameRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="cover-letter-thumbnail-frame"
      style={frameHeight ? { height: `${frameHeight}px` } : undefined}
    >
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
