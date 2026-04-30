const IMAGE_MATCH_RULES = {
	I_REVIEW: {
		dir_a: "com_id",
		dir_b: "com_tag",
		dir_c: "com_name",
		dir_d: "id",
		dir_e: "counsel_time",
	},
	U_PROFILE: {
		dir_d: "id",
	},
	F_REVIEW: {
		dir_a: "f_id",
		dir_d: "id",
	},
	QUESTION: {
		dir_a: "f_id",
		dir_d: "id",
	},
	BOARD: {
		dir_d: "id",
	},
	LOGO: {
		dir_a: "com_id",
		dir_b: "com_tag",
		dir_c: "com_name",
		dir_d: "logo",
	},
	FURNITURE: {
		dir_a: "f_id",
	},
	I_EXAMPLE: {
		dir_a: "com_id",
		dir_b: "com_tag",
		dir_c: "com_name",
		dir_d: "tag",
	},
	QA: {
		dir_a: "f_id",
		dir_d: "id",
	},
	C_PROFILE: {
		dir_a: "com_id",
		dir_b: "com_tag",
		dir_c: "com_name",
		dir_d: "info",
	},
	DEV: {
		dir_a: "id",
		dir_b: "event_name",
	},
};

const SetImageInList = (props) => {
	const { kind, orgList = [], view, imgData = [] } = props;
	const baseDIR = "http://localhost:8080/api/images";
	const rule = IMAGE_MATCH_RULES[kind === "Q&A" ? "QA" : kind];

	if (!rule) {
		return orgList;
	}

	const convertedImgData = imgData.map((img) => ({
		...img,
		img_name: `${baseDIR}/${kind}/${img.img_name}`,
	}));

	if (orgList === null || orgList.length === 0) {
		return convertedImgData;
	}

	return orgList.map((item) => {
		const matchedImages = convertedImgData.filter((img) =>
			Object.entries(rule).every(
				([imgColumn, itemColumn]) => String(img[imgColumn]) === String(item[itemColumn]),
			),
		);

		return {
			...item,
			imgList: matchedImages,
		};
	});
};

export default SetImageInList;
