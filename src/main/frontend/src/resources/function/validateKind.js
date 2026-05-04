const IMAGE_RULES = {
	I_REVIEW: { required: ["a", "b", "c", "d", "e"], desc: "Com ID, Name 등 필수" },
	U_PROFILE: { required: ["d"], desc: "USER ID 필수" },
	F_REVIEW: { required: ["a", "d"], desc: "F_ID, ID 필수" },
	QUESTION: { required: ["a", "d"], desc: "F_ID, ID 필수" },
	BOARD: { required: ["a", "d"], desc: "USER ID 필수" },
	LOGO: { required: ["a","b","c","d"], desc: "Com ID, Tag, Name 등 필수" },
	FURNITURE: { required: ["a"], desc: "F_ID 필수" },
	I_EXAMPLE: { required: ["a","b","c","d"], desc: "F_ID, ID 필수" },
	QA: { required: ["a", "d"], desc: "F_ID, ID 필수" },
	C_PROFILE: { required: ["a","b","c","d"], desc: "Com ID, Tag, Name 등 필수" },
	DEV: { required: ["a", "b"], desc: "Dev_ID, Event Name 필수" },
};

const validateImageQuery = (props) => {
	const { kind } = props;
	let rule;
	if (kind === "Q&A") rule = IMAGE_RULES["QA"];
	else rule = IMAGE_RULES[kind];

	// 1. 등록되지 않은 kind인지 확인
	if (!rule) {
		return { isValid: false, error: `정의되지 않은 카테고리(kind): ${kind}` };
	}

	// 2. 해당 kind의 필수 필드들이 props에 있는지 검사
	const missingFields = rule.required.filter((field) => !props[field] || props[field] === "");

	if (missingFields.length > 0) {
		return {
			isValid: false,
			error: `${kind} 형식에 필요한 [ ${missingFields.join(", ")} ] 데이터가 없습니다.`,
			guide: rule.desc,
		};
	}
	return { isValid: true, error: null };
};

export default validateImageQuery;
