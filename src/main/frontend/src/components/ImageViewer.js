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
  reply,
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
    <div 
      className="image-viewer" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
      >

      <div className="image-viewer-panel"
            onClick={(evt) => evt.stopPropagation()}>

        <button type="button" className="image-viewer-close" onClick={onClose}>
          ×
        </button>
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
            {star !== undefined && star !== null && Number(star) > 0 && (
              <div className="image-viewer-rating">
                <span className="image-viewer-stars">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const fillPercent = Math.max(
                      0,
                      Math.min(1, Number(star || 0) - (score - 1))
                    ) * 100;

                    return (
                      <span
                        key={score}
                        className="image-viewer-star"
                        style={{ "--fill": `${fillPercent}%` }}
                      >
                        ★
                      </span>
                    );
                  })}
                </span>

                <strong>{Number(star || 0)}</strong>
              </div>
            )}

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

          {reply && (
            <div className="image-viewer-reply">
              <strong>업체 답변</strong>

              {reply.fr_subject && (
                <div className="image-viewer-reply-title">
                  {reply.fr_subject}
                </div>
              )}

              <p>{reply.fr_content || "답변 내용이 없습니다."}</p>
            </div>
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