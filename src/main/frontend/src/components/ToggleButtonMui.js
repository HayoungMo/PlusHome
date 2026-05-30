import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";

/**
 * 공통 ToggleButton 컴포넌트
 *
 * MUI ToggleButtonGroup을 기반으로 만든 토글 버튼 그룹 컴포넌트입니다.
 * ButtonList 배열을 기준으로 여러 개의 ToggleButton을 렌더링하며,
 * value와 onChange를 외부 state와 연결하여 선택 상태를 제어할 수 있습니다.
 *
 * exclusive가 true이면 하나의 버튼만 선택할 수 있고,
 * false이면 여러 버튼을 동시에 선택할 수 있습니다.
 *
 * @param {Object} props
 * @param {string | number | Array<string | number>} props.value 현재 선택된 토글 값
 * @param {boolean} [props.exclusive=false] 단일 선택 여부. true이면 단일 선택, false이면 다중 선택
 * @param {Function} props.onChange 토글 값 변경 시 실행할 함수
 * @param {Object[]} [props.ButtonList=[]] 렌더링할 버튼 목록
 * @param {string | number} props.ButtonList[].value 버튼의 실제 선택 값
 * @param {string | React.ReactNode} props.ButtonList[].title 버튼에 표시할 내용
 *
 * @returns {JSX.Element} 단일 또는 다중 선택이 가능한 토글 버튼 그룹 UI
 */
const ToggleButtonMui = (props) => {
	const { value, exclusive = false, onChange, ButtonList = [] } = props;
	return (
		<ToggleButtonGroup
			value={value}
			exclusive={exclusive}
			onChange={onChange}
			aria-label="view type set">
			{ButtonList.map((record, index) => {
				return (
					<ToggleButton
						key={`${record.value}__${index}`}
						value={record.value}
						aria-label={`${record.title}__${index}`}>
						{record.title}
					</ToggleButton>
				);
			})}
		</ToggleButtonGroup>
	);
};

export default ToggleButtonMui;
