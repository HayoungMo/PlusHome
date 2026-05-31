import React from 'react';
import { Rating } from '@mui/material';

/**
 * 공통 Rating 컴포넌트
 *
 * MUI Rating을 기반으로 만든 별점 입력/표시 컴포넌트입니다.
 * value와 onChange를 외부 state와 연결하여 별점 값을 제어할 수 있으며,
 * precision, size, max 값을 통해 별점 단위, 크기, 최대 점수를 설정할 수 있습니다.
 * disabled 또는 readOnly 옵션을 통해 입력 불가 상태나 읽기 전용 상태로 사용할 수 있습니다.
 *
 * @param {Object} props
 * @param {number} props.value 현재 선택된 별점 값
 * @param {string} [props.name="ratingMui"] Rating 컴포넌트의 name 속성 값
 * @param {Function} props.onChange 별점 값 변경 시 실행할 함수
 * @param {number} [props.precision=1] 별점 선택 단위
 * @param {"small" | "medium" | "large"} [props.size="medium"] 별점 크기
 * @param {boolean} [props.disabled=false] 별점 선택 비활성화 여부
 * @param {boolean} [props.readOnly=false] 읽기 전용 여부
 * @param {number} [props.max=5] 표시할 최대 별점 개수
 *
 * @returns {JSX.Element} 별점 입력 또는 표시 UI
 */
const RatingMui = (props) => {
    const {value, name, onChange, precision, size, disabled, readOnly, max} = props

    const ratingName = name ? name : "ratingMui"
    const ratingPrecision = precision ? precision : 1
    const ratingSize = size ? size : "medium"
    const ratingMax = max ? max : 5
    const isDisabled = disabled ? true : false
    const isReadOnly = readOnly ? true : false
    return (
        <Rating
            name={ratingName}
            value={value}
            onChange={onChange}
            precision={ratingPrecision}
            size={ratingSize}
            max={ratingMax}
            disabled={isDisabled}
            readOnly={isReadOnly}>
        </Rating>
    );
};

export default RatingMui;