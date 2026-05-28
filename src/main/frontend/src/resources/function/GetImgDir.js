import ImageService from "../../service/imageService";
import SetImageInList from "./SetImageInList";
import validateImageQuery from "./validateKind";

const baseDIR = "/api/images";

const GetImgDir = async (props = {}) => {
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
	// webConfig에 등록된 외부 폴더 접근 디렉토리
	let sendObject = { kind, a, b, c, d, e, idx, tag };
	const imgData = await ImageService.runGetImage(sendObject, returnType);

	if (returnType === "one") {
		if (view) return { error: null, result: baseDIR + "/" + kind + "/" + imgData.img_name };
		else
			return {
				error: null,
				result: { ...imgData, img_name: baseDIR + "/" + kind + "/" + imgData.img_name },
			};
	}

	if (returnType === "list" && view) {
		const returnViewList = imgData.map((record) => ({
			...record,
			img_name: baseDIR + "/" + kind + "/" + record.img_name,
			img_idx: record.img_idx,
		}));
		return { error: null, result: returnViewList };
	}
	const result = SetImageInList({ kind, orgList, view, imgData });

	return { error: null, result: result };
};

export const getImgDirSimple = (props) => {
	const { kind, name } = props;
	return baseDIR + "/" + kind + "/" + name;
};

// export const getImgFurnitureThumbnail = (props) => {
// 	const { f_code } = props;
// };

export const getImgFurnitureList = async (furnitureList = []) => {
	const prm = furnitureList.map(async (record) => {
		const img = await ImageService.runGetImage({ kind: "FURNITURE", a: record.f_code }, "list");
		return { ...record, imageList: img };
	});

	const beforeMakeDir = await Promise.all(prm);

	const nowMakingDirInThisList = beforeMakeDir.map((record) => {
		const thisGotRealDir = record.imageList.map((imgData) => {
			return { ...imgData, img_src: `${baseDIR}/${imgData.img_kind}/${imgData.img_name}` };
		});
		return {
			...record,
			imageList: thisGotRealDir,
			thumbnail: thisGotRealDir.filter((thumb) => thumb.img_tag === "THUMBNAIL")[0].img_src,
		};
	});

	return nowMakingDirInThisList;
};

export default GetImgDir;
