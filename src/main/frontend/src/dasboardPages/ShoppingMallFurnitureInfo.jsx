import React, { useEffect, useMemo, useState } from "react";
import FurnitureAddPage from "../pages/FurnitureAddPage";
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogTitle,
	Tab,
	Tabs,
} from "@mui/material";
import TableMui from "./../components/TableMui";
import FurnitureService from "../service/furnitureService";
import AlertMui from "../components/AlertMui";
import GetImgDir, { getImgFurnitureList } from "./../resources/function/GetImgDir";
import FurnitureUpdatePage from "./../pages/FurnitureUpdatePage";
import DialogMui from "../components/DialogMui";

const ShoppingMallFurnitureInfo = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	const [tabValue, setTabValue] = useState("all");
	const [selectedTabCompany, setSelectedTabCompany] = useState({ c_id: id, c_name: "all" });
	const [selectedTabCompanyFurnitureList, setSelectedTabCompanyFurnitureList] = useState([]);
	const [allFurnitureList, setAllFurnitureList] = useState([]);

	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [selectedFurniture, setSelectedFurniture] = useState(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const dialogDeleteConfirmButtonList = [
		{
			title: "Cancel",
			color: "primary",
			variant: "outlined",
			onClick: () => setDeleteConfirmOpen(!deleteConfirmOpen),
		},
		{
			title: "Delete",
			color: "error",
			variant: "outlined",
			onClick: () => handleFurnitureDelete(),
		},
	];

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);

		const selectedCompany = shopListState.find((record) => record.c_name === newValue);

		setSelectedTabCompany(selectedCompany);
	};

	const handleFurnitureDelete = async () => {
		try {
			const result = await FurnitureService.deleteFurnitureOnDashboard(
				selectedFurniture.f_code,
			);
			if (result.success) {
				setAlertInfo({
					severity: "success",
					title: "삭제 성공",
					text: result.message,
				});
			} else {
				setAlertInfo({
					severity: "error",
					title: "삭제 실패",
					text: result.message,
				});
			}
			console.log(result);
		} catch (error) {
			setAlertInfo({
				severity: "error",
				title: "에러 발생",
				text: error,
			});
			console.log(error);
		}
		reloadFurnitureList();
		setDeleteConfirmOpen(!deleteConfirmOpen);
		setAlertOpen(!alertOpen);
	};

	const reloadFurnitureList = async () => {
		FurnitureService.getFurnitureByUserId(id).then((res) => {
			if (res.success === false) setAlertInfo({ severity: "error", text: res.message });
			else if (res.furnitureList == null)
				setAlertInfo({ severity: "info", text: res.message });

			if (res.success === true && res.furnitureList !== null) {
				setAlertInfo({ severity: "success", text: res.message });
				setAllFurnitureList(res.furnitureList);
			}
			setAlertOpen(!alertOpen);
		});
	};

	useEffect(() => {
		console.log("useEffect [allFurnitureList, tabValue] ===================");

		const makeImgDirInFurnitureList = async () => {
			let result = [];
			try {
				const imgDirInFurnitureList = await getImgFurnitureList(allFurnitureList);
				result = imgDirInFurnitureList;
			} catch (error) {
				console.error("데이터 로드 실패:", error);
			}
			if (tabValue === "all") {
				setSelectedTabCompanyFurnitureList(result);
			} else {
				const tabFurniture = result.filter((item) => item.c_name === tabValue);
				setSelectedTabCompanyFurnitureList(tabFurniture);
			}
		};

		makeImgDirInFurnitureList();
	}, [allFurnitureList, tabValue]);

	useEffect(() => {
		reloadFurnitureList();
	}, [id]);

	const FurnitureInfoDiv = ({ furniture }) => {
		const {
			c_id,
			c_kind,
			c_name,
			f_catagory1,
			f_catagory2,
			f_catagory3,
			f_catagory4,
			f_catagory5,
			f_code,
			f_count,
			f_createdDate,
			f_discount,
			f_dprice,
			f_name,
			f_point,
			f_price,
			f_viewCount,
			imageList,
			thumbnail,
		} = furniture;

		return (
			<div
				style={{
					width: "900px",
					border: "1px solid black",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
				}}>
				<div>
					<Checkbox />
				</div>
				<div>
					<img src={thumbnail} alt={f_code} width={100} />
				</div>
				<div>
					<div>{f_name}</div>
					<div>{f_dprice}</div>
					<div>{f_createdDate}</div>
				</div>
				<div>
					<Button color="success" variant="contained">
						리뷰 조회
					</Button>
					<Button color="success" variant="contained">
						주문 조회
					</Button>
				</div>
				<div>
					<Button
						color="primary"
						variant="contained"
						onClick={() => {
							setSelectedFurniture(furniture);
							setUpdateDialogOpen(true);
						}}>
						수정
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => {
							setSelectedFurniture(furniture);
							setDeleteConfirmOpen(true);
						}}>
						삭제
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div>
			<h3>상품 관리</h3>
			<hr />
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					{shopListState.map((record, index) => {
						return (
							<Tab
								key={`${record.c_id}__${index}`}
								label={record.c_name}
								value={record.c_name}
							/>
						);
					})}
				</Tabs>
			</Box>
			<div>
				{tabValue !== "all" && (
					<div style={{ border: "1px solid black", margin: "5px", padding: "5px" }}>
						<div>{selectedTabCompany.c_name}</div>
						<div>{selectedTabCompany.c_addr}</div>
						<div>{selectedTabCompany.c_boss}</div>
						<div>{selectedTabCompany.c_tel}</div>
					</div>
				)}
			</div>
			<div>
				{selectedTabCompanyFurnitureList?.map((record) => (
					<FurnitureInfoDiv furniture={record} />
				))}
				{/* <TableMui rowData={selectedTabCompanyFurnitureList} /> */}
			</div>
			<div>
				{tabValue !== "all" && (
					<Button
						variant="contained"
						color="primary"
						onClick={() => setAddDialogOpen(true)}>
						상품 등록
					</Button>
				)}
			</div>
			{alertOpen && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertOpen(!alertOpen)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
			{addDialogOpen && (
				<Dialog
					open={addDialogOpen}
					onClose={() => setAddDialogOpen(false)}
					maxWidth="md"
					fullWidth>
					<DialogTitle>상품 등록</DialogTitle>

					<DialogContent>
						<FurnitureAddPage
							cName={selectedTabCompany?.c_name || ""}
							onSuccess={async () => {
								await reloadFurnitureList();
								setAddDialogOpen(false);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			{updateDialogOpen && (
				<Dialog
					open={updateDialogOpen}
					onClose={() => setUpdateDialogOpen(false)}
					maxWidth="md"
					fullWidth>
					<DialogTitle>상품 수정</DialogTitle>

					<DialogContent>
						<FurnitureUpdatePage
							furniture={selectedFurniture}
							onSuccess={async () => {
								await reloadFurnitureList();
								setUpdateDialogOpen(false);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			{deleteConfirmOpen && (
				<DialogMui
					open={deleteConfirmOpen}
					onClose={() => setDeleteConfirmOpen(!deleteConfirmOpen)}
					title="Data delete?"
					text="Are you sure? Once deleted, this data cannot be recovered."
					buttons={dialogDeleteConfirmButtonList}
				/>
			)}
		</div>
	);
};

export default ShoppingMallFurnitureInfo;
