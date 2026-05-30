import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import React from "react";

/**
 * ToggleButtonMui 컴포넌트
 *
 * @param {Object} props
 * @param {state} props.value toggle이 사용할 ( 상태 변경에 활용할 ) state
 * @param {boolean} props.exclusive ??? 미안 잘 몰라
 * @param {function} props.onChange toggle 값 변경에 사용할 함수
 * @param {object[]} props.ButtonList 렌더링 될 버튼 목록 [ { value : , title : } ]
 *
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
