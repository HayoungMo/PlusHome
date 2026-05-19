import { Box, Tab, Tabs } from "@mui/material";
import React from "react";

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
