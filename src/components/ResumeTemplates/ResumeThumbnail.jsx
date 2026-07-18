import { useLayoutEffect, useRef, useState } from "react";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1120;

function ResumeThumbnail({ children, className = "" }) {
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  useLayoutEffect(() => {
    const updateScale = () => {
      const frame = frameRef.current;
      const content = contentRef.current;

      if (!frame || !content) return;

      const renderedWidth = content.scrollWidth || PAGE_WIDTH;
      const renderedHeight = content.scrollHeight || PAGE_HEIGHT;

      const widthScale = frame.clientWidth / renderedWidth;
      const heightScale = frame.clientHeight / renderedHeight;

      setScale(Math.min(widthScale, heightScale));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);

    if (frameRef.current) observer.observe(frameRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      ref={frameRef}
      className={`resume-thumbnail-frame ${className}`}
    >
      <div
        ref={contentRef}
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