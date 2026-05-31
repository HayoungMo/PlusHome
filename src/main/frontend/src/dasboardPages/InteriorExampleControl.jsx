import React, { useEffect, useMemo, useState } from "react";
import TableMui from "../components/TableMui";
import TabsMui from "../components/TabsMui";
import InteriorService from "../service/interiorService";
import InteriorExAdd from "../components/InteriorExAdd";
import AlertMui from "../components/AlertMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import InteriorModelViewer from "../components/InteriorModelViewer";
import { Button, Chip } from "@mui/material";
import InteriorExUpdate from "../components/InteriorExUpdate";
import SelectMui from "./../components/SelectMui";
import InteriorExModelAdd from "./../components/InteriorExModelAdd";
import InteriorExModelUpdate from "../components/InteriorExModelUpdate";
import ToggleButtonMui from "./../components/ToggleButtonMui";
import Loading from "../components/Loading";
import "../css/DashboardInterior.css";

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
		<div className="interior-example-empty">
			<strong>
				{viewType === "example"
					? "등록된 시공 사례가 없습니다."
					: "등록된 3D 모델이 없습니다."}
			</strong>
			<span>
				{tabValue === "all"
					? "업체를 선택한 뒤 새 자료를 등록할 수 있습니다."
					: "선택한 업체에 표시할 자료를 등록하세요."}
			</span>
			{interiorList.length !== 0 && (
				<div className="interior-example-empty-select">
					<SelectMui
						option={interiorList}
						onChange={(e) => {
							setTabValue(e.target.value);
						}}
					/>
				</div>
			)}
			{interiorList.length === 0 && viewType === "example" && (
				<div className="interior-example-form">
					<InteriorExAdd company={tabCompany} onReload={onReload} />
				</div>
			)}

			{interiorList.length === 0 && viewType === "model" && (
				<div className="interior-example-form">
					<InteriorExModelAdd
						company={tabCompany}
						setAlertInfo={setAlertInfo}
						setAlertOpen={setAlertOpen}
						onReload={onReload}
					/>
				</div>
			)}
		</div>
	);
};

const InteriorExampleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior") ?? [];
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("시공 사례 자료를 불러오는 중입니다...");
	const [viewType, setViewType] = useState("example");
	const [tabValue, setTabValue] = useState("all");
	const [tabCompany, setTabCompany] = useState({});
	const [alertInfo, setAlertInfo] = useState({});
	const [alertOpen, setAlertOpen] = useState(false);

	const [interiorExampleList, setInteriorExampleList] = useState([]);
	const [selectedInteriorExample, setSelectedInteriorExample] = useState({});
	const [selectedInteriorExampleImage, setSelectedInteriorExampleImage] = useState([]);

	const [model3DImageList, setModel3DImageList] = useState([]);
	const [selectedModel3DImage, setSelectedModel3DImage] = useState({});
	const [modelReloadKey, setModelReloadKey] = useState(Date.now());

	const [isUpdateAvailable, setUpdateAvailable] = useState(false);
	const [isAddAvailable, setAddAvailable] = useState(false);

	const emptyList = useMemo(() => [], []);

	const interiorListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "interior");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList, id]);

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

		interiorExampleList?.forEach((record, index) => {
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

	const selectedCompanyName = tabValue === "all" ? "전체 업체" : tabValue;
	const selectedImageCount = selectedInteriorExampleImage?.length ?? 0;

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
		if (newAlignment === null) return;
		setViewType(newAlignment);
		setSelectedInteriorExample({});
		setSelectedInteriorExampleImage([]);
		setUpdateAvailable(false);
		setAddAvailable(false);

		setSelectedModel3DImage({});
	};

	const reLoadData = async (showLoading = true) => {
		if (showLoading) {
			setIsLoading(true);
			setLoadingText("시공 사례 자료를 불러오는 중입니다...");
		}

		try {
			const result = await InteriorService.getInteriorExampleByCompanyId({ c_id: id });

			if (result.success === false) {
				setAlertInfo({
					severity: "error",
					title: "조회 실패",
					text: result.message,
				});
				setAlertOpen(true);

				setInteriorExampleList([]);
				setModel3DImageList([]);
				setSelectedInteriorExample({});
				setSelectedInteriorExampleImage([]);
				setSelectedModel3DImage({});
				setUpdateAvailable(false);
				setAddAvailable(false);
				return;
			}

			if (result.listSize === 0) {
				setAlertInfo({
					severity: "info",
					title: "조회 결과 없음",
					text: result.message,
				});
				setAlertOpen(true);

				setInteriorExampleList([]);
				setModel3DImageList(result.ModelDataList || []);
				setSelectedInteriorExample({});
				setSelectedInteriorExampleImage([]);
				setSelectedModel3DImage({});
				setModelReloadKey(Date.now());
				setUpdateAvailable(false);
				setAddAvailable(false);
				return;
			}

			const exampleData = result.exampleList.map((record) => ({
				...record,
				image: (record.image || []).map((img) => ({
					...img,
					img_dir: getImgDirSimple({
						kind: img.img_kind,
						name: img.img_name,
					}),
				})),
			}));

			setSelectedInteriorExample({});
			setSelectedInteriorExampleImage([]);
			setInteriorExampleList(exampleData);
			setModel3DImageList(result.ModelDataList || []);
			setModelReloadKey(Date.now());
			setSelectedModel3DImage({});
			setUpdateAvailable(false);
			setAddAvailable(false);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "시공 사례 자료를 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);

			setInteriorExampleList([]);
			setModel3DImageList([]);
			setSelectedInteriorExample({});
			setSelectedInteriorExampleImage([]);
			setSelectedModel3DImage({});
			setUpdateAvailable(false);
			setAddAvailable(false);
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
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
				setAlertInfo({ severity: "error", text: "수정할 시공 사례를 선택하세요." });
				setAlertOpen(true);
				return;
			}
			setUpdateAvailable(true);
			setAddAvailable(false);
		} else if (viewType === "model") {
			if (!selectedModel3DImage?.dir_d) {
				setAlertInfo({ severity: "error", text: "수정할 3D 모델을 선택하세요." });
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
	}, [selectedInteriorExample, onlyImageList]);

	useEffect(() => {
		setSelectedInteriorExample({});
		setSelectedInteriorExampleImage([]);
		setUpdateAvailable(false);
		setAddAvailable(false);

		setSelectedModel3DImage({});
	}, [tabValue]);

	return (
		<div className="interior-example-page">
			<div className="interior-example-header">
				<div>
					<h3>시공 사례 관리</h3>
					<p>인테리어 업체별 포트폴리오 이미지와 3D 모델 자료를 관리합니다.</p>
				</div>
				<div className="interior-example-summary">
					<Chip label={`업체 ${interior.length}개`} variant="outlined" />
					<Chip
						label={`사례 ${exampleMuiDisplayList.length}건`}
						color="primary"
						variant="outlined"
					/>
					<Chip
						label={`모델 ${model3DViewImageList.length}건`}
						color="secondary"
						variant="outlined"
					/>
				</div>
			</div>

			<section className="interior-example-card">
				<div className="interior-example-card-head">
					<div>
						<strong>자료 유형</strong>
						<span>시공 사례 이미지와 3D 모델을 전환해서 관리합니다.</span>
					</div>
					<Chip label={selectedCompanyName} variant="outlined" />
				</div>
				<div className="interior-example-toolbar">
					<ToggleButtonMui
						value={viewType}
						exclusive={true}
						onChange={handleViewType}
						ButtonList={[
							{ title: "시공 사례", value: "example" },
							{ title: "3D 모델", value: "model" },
						]}
					/>

					<TabsMui
						tabValue={tabValue}
						handleTabChange={handleTabChange}
						tabList={interiorListState}
						tabKey="c_id"
						label="c_name"
						value="c_name"
					/>
				</div>
				<div className="interior-example-actions">
					{tabValue !== "all" && (
						<Button
							variant="contained"
							color="success"
							onClick={onClickNewPost}
							disabled={isLoading}>
							새로 등록
						</Button>
					)}

					{(selectedInteriorExample?.c_id || selectedModel3DImage?.dir_d) && (
						<Button
							variant="contained"
							color="primary"
							onClick={onClickPostUpdate}
							disabled={isLoading}>
							수정하기
						</Button>
					)}
				</div>
			</section>

			{viewType === "example" &&
				(isLoading ? (
					<section className="interior-example-card">
						<Loading message={loadingText} />
					</section>
				) : exampleMuiDisplayList.length === 0 ? (
					<section className="interior-example-card">
						<ExampleIsEmpty
							tabValue={tabValue}
							setTabValue={setTabValue}
							interior={interior}
							tabCompany={tabCompany}
							onReload={reLoadData}
							viewType={viewType}
						/>
					</section>
				) : (
					<section className="interior-example-grid">
						<div className="interior-example-card">
							<div className="interior-example-card-head">
								<div>
									<strong>시공 사례 목록</strong>
									<span>
										목록에서 사례를 선택하면 등록된 이미지를 확인할 수 있습니다.
									</span>
								</div>
							</div>
							<div className="interior-example-table">
								<TableMui
									col={["ie_tag", "ie_tag2", "ie_content"]}
									columns={["분류", "세부 분류", "내용"]}
									rowData={exampleMuiDisplayList}
									selectedRow={selectedInteriorExample}
									setSelectedRow={setSelectedInteriorExample}
								/>
							</div>
						</div>

						<div className="interior-example-card">
							<div className="interior-example-card-head">
								<div>
									<strong>사례 이미지</strong>
									<span>선택한 사례에 연결된 이미지입니다.</span>
								</div>
								<Chip label={`${selectedImageCount}장`} variant="outlined" />
							</div>

							{selectedInteriorExampleImage?.length > 0 ? (
								<div className="interior-example-image-grid">
									{selectedInteriorExampleImage.map((record) => (
										<img
											key={`${record.img_name}-${record.img_idx ?? record.index}`}
											src={record.img_dir}
											alt={record.img_name || record.img_dir}
										/>
									))}
								</div>
							) : (
								<div className="interior-example-guide">
									시공 사례를 선택하면 이미지가 표시됩니다.
								</div>
							)}
						</div>

						{isUpdateAvailable && (
							<div className="interior-example-card interior-example-wide">
								<div className="interior-example-card-head">
									<div>
										<strong>시공 사례 수정</strong>
										<span>선택한 사례의 정보와 이미지를 수정합니다.</span>
									</div>
								</div>
								<div className="interior-example-form">
									<InteriorExUpdate
										selectedExample={selectedInteriorExample}
										imageList={selectedInteriorExampleImage}
										onReload={reLoadData}
									/>
								</div>
							</div>
						)}

						{tabValue !== "all" && isAddAvailable && (
							<div className="interior-example-card interior-example-wide">
								<div className="interior-example-card-head">
									<div>
										<strong>시공 사례 등록</strong>
										<span>
											선택한 업체에 새로운 포트폴리오 사례를 추가합니다.
										</span>
									</div>
								</div>
								<div className="interior-example-form">
									<InteriorExAdd company={tabCompany} onReload={reLoadData} />
								</div>
							</div>
						)}
					</section>
				))}

			{viewType === "model" &&
				(isLoading ? (
					<section className="interior-example-card">
						<Loading message={loadingText} />
					</section>
				) : model3DViewImageList.length === 0 ? (
					<section className="interior-example-card">
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
					</section>
				) : (
					<section className="interior-example-grid">
						<div className="interior-example-card">
							<div className="interior-example-card-head">
								<div>
									<strong>3D 모델 목록</strong>
									<span>모델 파일을 선택하면 미리보기가 표시됩니다.</span>
								</div>
							</div>
							<div className="interior-example-table">
								<TableMui
									rowData={model3DViewImageList}
									col={["index", "img_CreatedDate"]}
									columns={["번호", "등록일"]}
									selectedRow={selectedModel3DImage}
									setSelectedRow={setSelectedModel3DImage}
								/>
							</div>
						</div>

						<div className="interior-example-card">
							<div className="interior-example-card-head">
								<div>
									<strong>3D 모델 미리보기</strong>
									<span>선택한 모델을 확인합니다.</span>
								</div>
							</div>

							{selectedModel3DImage?.img_dir ? (
								<div className="interior-example-model-viewer">
									<InteriorModelViewer src={selectedModel3DImage.img_dir} />
								</div>
							) : (
								<div className="interior-example-guide">
									3D 모델을 선택하면 미리보기가 표시됩니다.
								</div>
							)}
						</div>

						{isUpdateAvailable && (
							<div className="interior-example-card interior-example-wide">
								<div className="interior-example-card-head">
									<div>
										<strong>3D 모델 수정</strong>
										<span>선택한 모델 자료를 수정합니다.</span>
									</div>
								</div>
								<div className="interior-example-form">
									<InteriorExModelUpdate
										model={selectedModel3DImage}
										setAlertInfo={setAlertInfo}
										setAlertOpen={setAlertOpen}
										onReload={reLoadData}
									/>
								</div>
							</div>
						)}

						{tabValue !== "all" && isAddAvailable && (
							<div className="interior-example-card interior-example-wide">
								<div className="interior-example-card-head">
									<div>
										<strong>3D 모델 등록</strong>
										<span>선택한 업체에 새로운 3D 모델을 추가합니다.</span>
									</div>
								</div>
								<div className="interior-example-form">
									<InteriorExModelAdd
										company={tabCompany}
										setAlertInfo={setAlertInfo}
										setAlertOpen={setAlertOpen}
										onReload={reLoadData}
									/>
								</div>
							</div>
						)}
					</section>
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
