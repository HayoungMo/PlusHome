import React from "react";
import { Button } from "@mui/material";

const EmptyCompanyGuide = ({ type, onClick }) => {
	const textMap = {
		shop: {
			title: "등록된 쇼핑몰 업체가 없습니다.",
			desc: "쇼핑몰 관리 기능을 사용하려면 먼저 쇼핑몰 정보를 등록해주세요.",
			button: "쇼핑몰 등록하기",
		},
		interior: {
			title: "등록된 인테리어 업체가 없습니다.",
			desc: "인테리어 관리 기능을 사용하려면 먼저 인테리어 업체 정보를 등록해주세요.",
			button: "인테리어 업체 등록하기",
		},
	};

	const text = textMap[type];

	return (
		<div>
			<h2>{text.title}</h2>
			<p>{text.desc}</p>
			<Button variant="contained" onClick={onClick}>
				{text.button}
			</Button>
		</div>
	);
};

export default EmptyCompanyGuide;