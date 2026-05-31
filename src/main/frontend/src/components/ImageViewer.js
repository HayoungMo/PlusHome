import React, { useEffect, useState } from "react";
import "../css/ImageViewer.css";

/**
 * 이미지 뷰어 모달 컴포넌트
 *
 * 이미지 목록을 모달 형태로 확대해서 보여주는 컴포넌트입니다.
 * 여러 이미지가 있을 경우 이전/다음 버튼, 썸네일, 키보드 방향키로 이미지를 이동할 수 있습니다.
 * ESC 키 또는 배경 클릭으로 닫을 수 있으며,
 * 제목, 내용, 작성자, 날짜, 별점, 업체 답변 등의 부가 정보를 함께 표시할 수 있습니다.
 *
 * @param {Object} props
 * @param {boolean} props.open 이미지 뷰어 표시 여부
 * @param {Object[]} [props.images=[]] 표시할 이미지 목록
 * @param {string} props.images[].src 이미지 경로
 * @param {string} [props.images[].alt] 이미지 대체 텍스트
 * @param {string} [props.images[].title] 이미지 제목
 * @param {string} [props.images[].content] 이미지 또는 리뷰 내용
 * @param {string} [props.images[].date] 이미지 또는 리뷰 작성일
 * @param {string} [props.images[].writer] 이미지 또는 리뷰 작성자
 * @param {number} [props.startIndex=0] 처음 표시할 이미지 index
 * @param {Function} props.onClose 이미지 뷰어를 닫을 때 실행할 함수
 * @param {string} [props.title] 우측 영역에 표시할 제목
 * @param {string} [props.content] 우측 영역에 표시할 내용
 * @param {string} [props.date] 우측 영역에 표시할 날짜
 * @param {string} [props.writer] 우측 영역에 표시할 작성자
 * @param {number | string} [props.star] 별점 값
 * @param {Object} [props.reply] 업체 답변 정보
 * @param {string} [props.reply.fr_subject] 업체 답변 제목
 * @param {string} [props.reply.fr_content] 업체 답변 내용
 *
 * @returns {JSX.Element|null} 이미지 뷰어 모달 UI
 */
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