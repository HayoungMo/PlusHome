import React, { useEffect, useState } from "react";
import "../css/ImageViewer.css";

const ImageViewer = ({
  open,
  images = [],
  startIndex = 0,
  onClose,
  title,
  content,
  date,
  writer,
  star,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [open, startIndex]);

  const movePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const moveNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (evt) => {
      if (evt.key === "Escape") onClose?.();
      if (evt.key === "ArrowLeft" && images.length > 1) movePrev();
      if (evt.key === "ArrowRight" && images.length > 1) moveNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="image-viewer" role="dialog" aria-modal="true">
      <button type="button" className="image-viewer-close" onClick={onClose}>
        ×
      </button>

      <div className="image-viewer-panel">
        <div className="image-viewer-left">
          {images.length > 1 && (
            <button
              type="button"
              className="image-viewer-arrow image-viewer-arrow-prev"
              onClick={movePrev}
            >
              ‹
            </button>
          )}

          <div className="image-viewer-main">
            <img
              src={currentImage.src}
              alt={currentImage.alt || title || "이미지"}
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="image-viewer-arrow image-viewer-arrow-next"
              onClick={moveNext}
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <div className="image-viewer-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image.src}-${index}`}
                  className={currentIndex === index ? "active" : ""}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img src={image.src} alt={image.alt || "이미지 미리보기"} />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="image-viewer-right">
          <div className="image-viewer-heading">
            <div className="image-viewer-rating">
              <span>★</span>
              <strong>{Number(star || 0)}</strong>
            </div>

            <h3>{title || currentImage.title || "이미지"}</h3>
          </div>

          <div className="image-viewer-meta">
            {(date || currentImage.date) && (
              <span>{date || currentImage.date}</span>
            )}
            {(writer || currentImage.writer) && (
              <span>{writer || currentImage.writer}</span>
            )}
          </div>

          {(content || currentImage.content) && (
            <p>{content || currentImage.content}</p>
          )}

          {images.length > 1 && (
            <div className="image-viewer-count">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ImageViewer;