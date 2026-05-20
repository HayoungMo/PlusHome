import React, { useEffect, useMemo, useState } from "react";
import TableMui from "../components/TableMui";
import TabsMui from "../components/TabsMui";
import InteriorService from "../service/interiorService";
import InteriorExAdd from "../components/InteriorExAdd";
import AlertMui from "../components/AlertMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import InteriorModelViewer from "../components/InteriorModelViewer";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import InteriorExUpdate from "../components/InteriorExUpdate";

const InteriorExampleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior") ?? [];

	const [viewType, setViewType] = useState("example");
	const [tabValue, setTabValue] = useState("all");
	const [tabCompany, setTabCompany] = useState({});
	const [alertInfo, setAlertInfo] = useState({});
	const [alertOpen, setAlertOpen] = useState(false);

	const [interiorExampleList, setInteriorExampleList] = useState([]);
	const [selectedInteriorExample, setSelectedInteriorExample] = useState({});
	const [selectedInteriorExampleImage, setSelectedInteriorExampleImage] = useState({});

	const [model3DImageList, setModel3DImageList] = useState([]);
	const [selectedModel3DImage, setSelectedModel3DImageList] = useState({});

	const [isUpdateAvailable, setUpdateAvailable] = useState(false);
	const [isAddAvailable, setAddAvailable] = useState(false);

	const emptyList = useMemo(() => [], []);

	const interiorListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "interior");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const exampleMuiDisplayList = useMemo(() => {
		if (!interiorExampleList || interiorExampleList.length === 0) return emptyList;

		const rowIndexList = interiorExampleList?.map((record, index) => {
			return { ...record.example, index };
		});

		if (tabValue !== "all") {
			const filterList = rowIndexList.filter((data) => data.c_name === tabValue);
			return filterList;
		} else {
			return rowIndexList;
		}
	}, [interiorExampleList, emptyList, tabValue]);

	const onlyImageList = useMemo(() => {
		if (!interiorExampleList || interiorExampleList.length === 0) return emptyList;

		let resultList = [];

		interiorExampleList?.map((record, index) => {
			if (record.image.length !== 0) {
				record.image.forEach((element) => {
					resultList.push({ ...element, index });
				});
			}
		});

		return resultList;
	}, [interiorExampleList, emptyList]);

	const model3DViewImageList = useMemo(() => {
		if (!model3DImageList || model3DImageList.length === 0) return emptyList;

		let resultList = [];

		model3DImageList?.forEach((element, index) => {
			const image3d = {
				...element,
				img_dir: getImgDirSimple({ kind: element.img_kind, name: element.img_name }),
				index,
			};
			resultList.push(image3d);
		});

		return resultList;
	}, [model3DImageList, emptyList]);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
		if (newValue === "all") {
			setTabCompany({});
		} else {
			const tabCom = interior.find((data) => data.c_name === newValue);
			setTabCompany(tabCom);
		}
	};

	const handleViewType = (event, newAlignment) => {
		setViewType(newAlignment);
	};

	const reLoadData = async () => {
		const result = await InteriorService.getInteriorExampleByCompanyId({ c_id: id });

		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		} else if (result.listSize === 0) {
			setAlertInfo({ severity: "info", text: result.message });
			setAlertOpen(true);
		} else {
			const exampleData = result.exampleList.map((record) => ({
				...record,
				image: (record.image || []).map((img) => ({
					...img,
					img_dir: getImgDirSimple({ kind: img.img_kind, name: img.img_name }),
				})),
			}));
			setSelectedInteriorExample({});
			setSelectedInteriorExampleImage([]);
			setInteriorExampleList(exampleData);
			setModel3DImageList(result.ModelDataList);
		}
	};

	const onClickNewPost = () => {
		setUpdateAvailable(false);
		setAddAvailable(true);
	};

	const onClickPostUpdate = () => {
		if (!selectedInteriorExample.c_id) {
			setAlertInfo({ severity: "error", text: "수정할 데이터를 선택하세요." });
			setAlertOpen(true);
			return;
		}
		setUpdateAvailable(true);
		setAddAvailable(false);
	};

	const tagOptions1 = [
		{ value: "apt", title: "아파트" },
		{ value: "villa", title: "빌라" },
		{ value: "house", title: "단독주택" },
		{ value: "officetel", title: "오피스텔" },
	];
	const tagOptions2 = [
		{ value: "kitchen", title: "키친" },
		{ value: "bath", title: "바스" },
		{ value: "storage", title: "수납" },
		{ value: "door", title: "중문/문" },
		{ value: "window", title: "창문" },
		{ value: "wallpaper", title: "벽지" },
		{ value: "lighting", title: "조명" },
		{ value: "tile", title: "타일" },
		{ value: "floor", title: "마루" },
	];

	useEffect(() => {
		reLoadData();
	}, [id]);

	useEffect(() => {
		if (!selectedInteriorExample) {
			setSelectedInteriorExampleImage([]);
			return;
		}
		const imageList = onlyImageList?.filter(
			(data) => data.index === selectedInteriorExample.index,
		);
		console.log(imageList);
		console.log(selectedInteriorExample);
		setSelectedInteriorExampleImage(imageList || []);
	}, [selectedInteriorExample]);

	return (
		<div>
			<ToggleButtonGroup
				value={viewType}
				exclusive
				onChange={handleViewType}
				aria-label="view type set">
				<ToggleButton value="example" aria-label="example">
					Example
				</ToggleButton>
				<ToggleButton value="model" aria-label="model">
					Model
				</ToggleButton>
			</ToggleButtonGroup>

			<TabsMui
				tabValue={tabValue}
				handleTabChange={handleTabChange}
				tabList={interiorListState}
				tabKey="c_id"
				label="c_name"
				value="c_name"
			/>
			{viewType === "example" &&
				(exampleMuiDisplayList.length === 0 ? (
					<div>
						등록된 시공 사례가 없습니다.
						<div>시공 사례를 등록할 회사를 선택 해 주세요</div>
					</div>
				) : (
					<div>
						<div
							style={{
								margin: "15px 15px 15px 0px",
								display: "flex",
								width: "200px",
								justifyContent: "space-between",
							}}>
							{tabValue !== "all" && (
								<Button
									variant="contained"
									color="success"
									onClick={onClickNewPost}>
									새로쓰기
								</Button>
							)}
							{selectedInteriorExample?.c_id && (
								<Button
									variant="contained"
									color="primary"
									onClick={onClickPostUpdate}>
									수정하기
								</Button>
							)}
						</div>
						<TableMui
							col={["ie_tag", "ie_tag2", "ie_content"]}
							rowData={exampleMuiDisplayList}
							selectedRow={selectedInteriorExample}
							setSelectedRow={setSelectedInteriorExample}
						/>
						{isUpdateAvailable && (
							<InteriorExUpdate
								selectedExample={selectedInteriorExample}
								imageList={selectedInteriorExampleImage}
								onReload={reLoadData}
							/>
						)}
						{selectedInteriorExampleImage?.map((record) => (
							<img src={record.img_dir} alt={record.img_dir} />
						))}
						{tabValue !== "all" && isAddAvailable && (
							<InteriorExAdd company={tabCompany} />
						)}
					</div>
				))}
			{viewType === "model" && (
				<div>
					<TableMui
						rowData={model3DViewImageList}
						col={["index", "img_CreatedDate"]}
						selectedRow={selectedModel3DImage}
						setSelectedRow={setSelectedModel3DImageList}
					/>
					{selectedModel3DImage && (
						<InteriorModelViewer src={selectedModel3DImage.img_dir} />
					)}
				</div>
			)}

			{alertOpen && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertOpen(false)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default InteriorExampleControl;
