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
import SelectMui from "./../components/SelectMui";
import InteriorExModelAdd from "./../components/InteriorExModelAdd";
import InteriorExModelUpdate from "../components/InteriorExModelUpdate";

const ExampleIsEmpty = (props) => {
	const {
		tabValue,
		setTabValue,
		interior,
		tabCompany,
		onReload,
		viewType,
		setAlertInfo,
		setAlertOpen,
	} = props;

	let interiorList = [];

	if (tabValue === "all") {
		interior.forEach((data) => {
			interiorList.push({ title: data.c_name, value: data.c_name });
		});
	}

	return (
		<div>
			<div>등록된 시공 사례가 없습니다</div>
			{interiorList.length !== 0 && (
				<div>
					<div>사례를 등록할 회사를 선택해 주세요</div>
					<SelectMui
						option={interiorList}
						onChange={(e) => {
							setTabValue(e.target.value);
						}}
					/>
				</div>
			)}
			{interiorList.length === 0 && viewType === "example" && (
				<InteriorExAdd company={tabCompany} onReload={onReload} />
			)}

			{interiorList.length === 0 && viewType === "model" && (
				<InteriorExModelAdd
					company={tabCompany}
					setAlertInfo={setAlertInfo}
					setAlertOpen={setAlertOpen}
					onReload={onReload}
				/>
			)}
		</div>
	);
};

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
	const [selectedModel3DImage, setSelectedModel3DImage] = useState({});
	const [modelReloadKey, setModelReloadKey] = useState(Date.now());

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
		const getModelDir = (model) => {
			const modelDir = getImgDirSimple({ kind: model.img_kind, name: model.img_name });
			return `${modelDir}?v=${modelReloadKey}`;
		};

		if (tabValue !== "all") {
			const filterdList = model3DImageList?.filter((data) => data.dir_c === tabValue) || [];

			filterdList?.forEach((element, index) => {
				const image3d = {
					...element,
					img_dir: getModelDir(element),
					index,
				};
				resultList.push(image3d);
			});
		} else {
			model3DImageList?.forEach((element, index) => {
				const image3d = {
					...element,
					img_dir: getModelDir(element),
					index,
				};
				resultList.push(image3d);
			});
		}

		return resultList;
	}, [model3DImageList, emptyList, tabValue, modelReloadKey]);

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
		// Example
		setSelectedInteriorExample({});
		setSelectedInteriorExampleImage([]);
		setUpdateAvailable(false);
		setAddAvailable(false);

		//Model
		setSelectedModel3DImage({});
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
			setModelReloadKey(Date.now());
			setUpdateAvailable(false);
			setAddAvailable(false);
		}
	};

	const onClickNewPost = () => {
		setUpdateAvailable(false);
		setAddAvailable(true);
		setSelectedModel3DImage({});
	};

	const onClickPostUpdate = () => {
		if (viewType === "example") {
			if (!selectedInteriorExample.c_id) {
				setAlertInfo({ severity: "error", text: "수정할 데이터를 선택하세요." });
				setAlertOpen(true);
				return;
			}
			setUpdateAvailable(true);
			setAddAvailable(false);
		} else if (viewType === "model") {
			if (!selectedModel3DImage?.dir_d) {
				setAlertInfo({ severity: "error", text: "수정할 데이터를 선택하세요." });
				setAlertOpen(true);
				return;
			}
			setUpdateAvailable(true);
			setAddAvailable(false);
		}
	};

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
		setSelectedInteriorExampleImage(imageList || []);
	}, [selectedInteriorExample]);

	useEffect(() => {
		// Example
		setSelectedInteriorExample({});
		setSelectedInteriorExampleImage([]);
		setUpdateAvailable(false);
		setAddAvailable(false);

		//Model
		setSelectedModel3DImage({});
	}, [tabValue]);

	useEffect(() => {
		console.log(selectedModel3DImage);
	}, [selectedModel3DImage]);

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
			<div
				style={{
					margin: "15px 15px 15px 0px",
					display: "flex",
					width: "200px",
					justifyContent: "space-between",
				}}>
				{tabValue !== "all" && (
					<Button variant="contained" color="success" onClick={onClickNewPost}>
						새로쓰기
					</Button>
				)}
				{(selectedInteriorExample?.c_id || selectedModel3DImage?.dir_d) && (
					<Button variant="contained" color="primary" onClick={onClickPostUpdate}>
						수정하기
					</Button>
				)}
			</div>
			{viewType === "example" &&
				(exampleMuiDisplayList.length === 0 ? (
					<div>
						<ExampleIsEmpty
							tabValue={tabValue}
							setTabValue={setTabValue}
							interior={interior}
							tabCompany={tabCompany}
							onReload={reLoadData}
							viewType={viewType}
						/>
					</div>
				) : (
					<div>
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
							<InteriorExAdd company={tabCompany} onReload={reLoadData} />
						)}
					</div>
				))}
			{viewType === "model" &&
				(model3DViewImageList.length === 0 ? (
					<div>
						<ExampleIsEmpty
							tabValue={tabValue}
							setTabValue={setTabValue}
							interior={interior}
							tabCompany={tabCompany}
							onReload={reLoadData}
							viewType={viewType}
							setAlertInfo={setAlertInfo}
							setAlertOpen={setAlertOpen}
						/>
					</div>
				) : (
					<div>
						<div
							style={{
								margin: "15px 15px 15px 0px",
								display: "flex",
								width: "200px",
								justifyContent: "space-between",
							}}></div>
						<TableMui
							rowData={model3DViewImageList}
							col={["index", "img_CreatedDate"]}
							selectedRow={selectedModel3DImage}
							setSelectedRow={setSelectedModel3DImage}
						/>
						{selectedModel3DImage?.img_dir && (
							<InteriorModelViewer src={selectedModel3DImage.img_dir} />
						)}
						{isUpdateAvailable && (
							<InteriorExModelUpdate
								model={selectedModel3DImage}
								setAlertInfo={setAlertInfo}
								setAlertOpen={setAlertOpen}
								onReload={reLoadData}
							/>
						)}
						{tabValue !== "all" && isAddAvailable && (
							<InteriorExModelAdd
								company={tabCompany}
								setAlertInfo={setAlertInfo}
								setAlertOpen={setAlertOpen}
								onReload={reLoadData}
							/>
						)}
					</div>
				))}

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
