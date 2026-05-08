import React from 'react';
import '../../../css/RotatingWords.css'; 

const RotatingWords = () => {
  return (
    <div className="rotating-wrapper">
      <span>오늘의가구는 </span>
      
      <div className="rotating-window">
        <ul className="rotating-list">
          {/* 아이템들 */}
          <li className="rotating-item bg-designer">푹신푹신한침대</li>
          <li className="rotating-item bg-developer">일잘러 되는 의자</li>
          <li className="rotating-item bg-manager">나만의 공간을 아늑하게 해줄 책상</li>
          
          {/* [중요] 무한 루프를 위해 첫 번째 아이템을 똑같이 한 번 더 적어줌 */}
          <li className="rotating-item bg-designer">Designers</li>
        </ul>
      </div>
    </div>
  );
};

export default RotatingWords;