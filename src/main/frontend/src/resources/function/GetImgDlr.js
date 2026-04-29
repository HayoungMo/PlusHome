import ImageService from "../../service/imageService";
import validateImageQuery from "./validateKind";

const GetImgDlr = async (props = {}) => {
	if (!props || Object.keys(props).length === 0) {
		return { error: "데이터가 전달되지 않았습니다.", result: null };
	}
	const { kind, view = false, returnType, a, b, c, d, e, idx = -1, tag, orgList = null } = props;

	const requiredFields = ["kind", "returnType"];
	for (const field of requiredFields) {
		if (!props[field]) {
			return { error: `필수 항목인 ${field} 정보가 없습니다.`, result: null };
		}
	}

	const vaildateCheck = validateImageQuery(props);

	if (!vaildateCheck.isValid) {
		return { error: vaildateCheck.error, result: null };
	}

	if (returnType !== "list" && returnType !== "one") {
		return { error: "잘못된 반환 형식(returnType) 요청입니다.", result: null };
	}
	const baseDIR = "http://localhost:8080/api/images"; // webConfig에 등록된 외부 폴더 접근 디렉토리
	let sendObject = { kind, a, b, c, d, e, idx, tag };
	const result = await ImageService.runGetImage(sendObject, returnType);

	// const result = processedData()
	if (returnType === "one") {
		if (view) return baseDIR + "/" + kind + "/" + result.img_name;
		else
			return {
				...result,
				img_name: baseDIR + "/" + kind + "/" + result.img_name,
			};
	} else {
		return result.map((record) => ({
			...record,
			img_name: baseDIR + "/" + kind + "/" + record.img_name,
		}));
	}
};

// const processedData = (props) => {}

export default GetImgDlr;
