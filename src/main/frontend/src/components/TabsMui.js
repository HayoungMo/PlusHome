import { Box, Tab, Tabs } from "@mui/material";
import React from "react";

/**
 * TabsMui 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.label tab이 보이게 할 값
 * @param {state} props.tabValue tab이 사용할 ( 상태 변경에 활용할 ) state
 * @param {function} props.handleTabChange tab 값이 변경될 때 사용할 function
 * @param {object[]} props.tabList tab을 구현할 때 사용될 배열 
 * @param {string} props.value tab에 실제로 가지게 될 값 ( tabList에서 해당 string을 key 값으로 찾음 )
 * @param {string} props.tabKey tab의 key를 만들때 사용할 값 (  tabList에서 해당 string을 key 값으로 찾음  )
 *
 */
const TabsMui = (props) => {
	const { tabValue, handleTabChange, tabList, tabKey, label, value } = props;

	return (
		<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
			<Tabs value={tabValue} onChange={handleTabChange}>
				{tabList.map((record, index) => {
					return (
						<Tab
							key={`${record[tabKey] ?? record[value] ?? index}__${index}`}
							label={record[label]}
							value={record[value]}
						/>
					);
				})}
			</Tabs>
		</Box>
	);
};

export default TabsMui;
