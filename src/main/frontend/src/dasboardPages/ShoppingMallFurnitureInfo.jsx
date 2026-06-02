import React, { useCallback, useEffect, useMemo, useState } from "react";
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
	Pagination,
} from "@mui/material";
import TableMui from "./../components/TableMui";
import FurnitureService from "../service/furnitureService";
import AlertMui from "../components/AlertMui";
import GetImgDir, { getImgFurnitureList } from "./../resources/function/GetImgDir";
import FurnitureUpdatePage from "./../pages/FurnitureUpdatePage";
import DialogMui from "../components/DialogMui";
import FilterBar from "../components/FilterBar";
import TabsMui from "../components/TabsMui";
import dayjs from "dayjs";
import SkeletonMui from "../components/SkeletonMui";

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
	const [allFurnitureList, setAllFurnitureList] = useState([]);
	const [allFurnitureImgList, setAllFurnitureImgList] = useState([]);

	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [selectedFurniture, setSelectedFurniture] = useState(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [filterBarState, setFilterBarState] = useState({});

	const [furnitureLoading, setFurnitureLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);

	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const isProductLoading = furnitureLoading || imageLoading;

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
		setFilterBarState({});
		setPage(1);
	};

	const handleFilterChange = (nextFilterValue) => {
		setFilterBarState(nextFilterValue);
		setPage(1);
	};

	const getUniqueFilterOptions = useCallback((list, key) => {
		return [...new Set(list.map((item) => item[key]).filter(Boolean))].map((item) => ({
			value: item,
			title: item,
		}));
	}, []);

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

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const reloadFurnitureList = async () => {
		setFurnitureLoading(true);

		try {
			const res = await FurnitureService.getFurnitureByUserId(id);

			if (res.success === false) {
				setAlertInfo({
					severity: "error",
					text: res.message,
				});
				setAllFurnitureList([]);
				return;
			}

			if (res.furnitureList == null) {
				setAlertInfo({
					severity: "info",
					text: res.message,
				});
				setAllFurnitureList([]);
				return;
			}

			setAlertInfo({
				severity: "success",
				text: res.message,
			});
			setAllFurnitureList(res.furnitureList);
		} catch (error) {
			setAlertInfo({
				severity: "error",
				title: "에러 발생",
				text: String(error),
			});
			setAllFurnitureList([]);
		} finally {
			setFurnitureLoading(false);
			setAlertOpen(true);
		}
	};

	const selectedTabCompanyFurnitureList = useMemo(() => {
		if (tabValue === "all") {
			return allFurnitureImgList;
		}

		return allFurnitureImgList.filter((item) => item.c_name === tabValue);
	}, [allFurnitureImgList, tabValue]);

	const productFilterList = useMemo(() => {
		return [
			{
				key: "f_catagory1",
				title: "가구 종류",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_catagory1"),
			},
			{
				key: "f_catagory2",
				title: "공간",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_catagory2"),
			},
			{
				key: "f_catagory3",
				title: "스타일",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_catagory3"),
			},
			{
				key: "f_catagory4",
				title: "소재/특징",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_catagory4"),
			},
			{
				key: "f_catagory5",
				title: "라이프스타일",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_catagory5"),
			},
			{
				key: "f_name",
				title: "상품",
				type: "multi",
				options: getUniqueFilterOptions(selectedTabCompanyFurnitureList, "f_name"),
			},
		].filter((filter) => filter.options.length > 0);
	}, [getUniqueFilterOptions, selectedTabCompanyFurnitureList]);

	const filteredFurnitureList = useMemo(() => {
		return selectedTabCompanyFurnitureList.filter((data) => {
			return Object.entries(filterBarState).every(([key, value]) => {
				if (value === "" || value === null || value === undefined) return true;
				if (Array.isArray(value)) {
					if (value.length === 0) return true;
					return value.map(String).includes(String(data[key]));
				}
				return data[key] === value;
			});
		});
	}, [selectedTabCompanyFurnitureList, filterBarState]);

	const pageCount = useMemo(() => {
		return Math.ceil(filteredFurnitureList.length / rowsPerPage);
	}, [filteredFurnitureList.length, rowsPerPage]);

	const visibleFurnitureList = useMemo(() => {
		const startIndex = (page - 1) * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;

		return filteredFurnitureList.slice(startIndex, endIndex);
	}, [filteredFurnitureList, page, rowsPerPage]);

	useEffect(() => {
		const makeImgDirInFurnitureList = async () => {
			setImageLoading(true);

			try {
				const imgDirInFurnitureList = await getImgFurnitureList(allFurnitureList);
				setAllFurnitureImgList(imgDirInFurnitureList);
			} catch (error) {
				console.error("데이터 로드 실패:", error);
				setAllFurnitureImgList([]);
			} finally {
				setImageLoading(false);
			}
		};

		if (allFurnitureList.length === 0) {
			setAllFurnitureImgList([]);
			setImageLoading(false);
			return;
		}

		makeImgDirInFurnitureList();
	}, [allFurnitureList]);

	useEffect(() => {
		reloadFurnitureList();
	}, [id]);

	useEffect(() => {
		if (filteredFurnitureList.length === 0) {
			if (page !== 1) {
				setPage(1);
			}
			return;
		}

		if (page < 1) {
			setPage(1);
			return;
		}

		if (page > pageCount) {
			setPage(pageCount);
		}
	}, [filteredFurnitureList.length, page, pageCount]);

	const FurnitureInfoDiv = ({ furniture }) => {
		const {
			// c_id,c_kind,c_name,f_catagory1,f_catagory2,f_catagory3,f_catagory4,f_catagory5,f_count,f_discount,f_point,f_price,f_viewCount,imageList,
			f_code,
			f_createdDate,
			f_dprice,
			f_name,
			thumbnail,
			r_count,
			a_count,
			star_avg,
			cart_total_f_count,
			cart_total_f_price,
			cart_avg_f_count,
			cart_total_buy,
		} = furniture;

		return (
			<div className="shopping-mall-product-card">
				<div className="shopping-mall-product-thumb">
					<img src={thumbnail} alt={f_code} />
				</div>
				<div className="shopping-mall-product-main">
					<div className="shopping-mall-product-name">{f_name}</div>
					<div className="shopping-mall-product-price">{f_dprice.toLocaleString()}원</div>
					<div className="shopping-mall-product-date">
						{dayjs(f_createdDate).format("YYYY-MM-DD")}
					</div>
				</div>
				<div className="shopping-mall-product-metrics">
					<div>리뷰 갯수 : {r_count}</div>
					<div>답변 갯수 : {a_count}</div>
					<div>평균 별점 : {star_avg}</div>
				</div>
				<div className="shopping-mall-product-metrics">
					<div>판매된 물품 합 : {cart_total_f_count}</div>
					<div>판매된 금액 합 : {cart_total_f_price}</div>
					<div>평균 구매 갯수 : {cart_avg_f_count}</div>
					<div>총 판매 횟수 : {cart_total_buy}</div>
				</div>
				<div className="shopping-mall-product-actions">
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
		<div className="shopping-mall-product-page">
			<div className="shopping-mall-product-header">
				<h3>상품 관리</h3>
			</div>
			<TabsMui
				tabValue={tabValue}
				handleTabChange={handleTabChange}
				tabList={shopListState}
				tabKey="c_id"
				label="c_name"
				value="c_name"
			/>

			<div>
				{tabValue !== "all" && (
					<div className="shopping-mall-company-summary">
						<div>{selectedTabCompany.c_name}</div>
						<div>{selectedTabCompany.c_addr}</div>
						<div>{selectedTabCompany.c_boss}</div>
						<div>{selectedTabCompany.c_tel}</div>
					</div>
				)}
			</div>
			<div className="shopping-mall-product-filter">
				<FilterBar
					filterList={productFilterList}
					value={filterBarState}
					onChange={handleFilterChange}
				/>
			</div>
			<div className="shopping-mall-product-list">
				{isProductLoading ? (
					<SkeletonMui variant="shoppingMallProductCard" count={rowsPerPage} />
				) : filteredFurnitureList?.length > 0 ? (
					visibleFurnitureList.map((record) => (
						<FurnitureInfoDiv key={record.f_code} furniture={record} />
					))
				) : (
					<div className="shopping-mall-empty-state">
						{selectedTabCompanyFurnitureList.length > 0
							? "선택한 조건에 해당하는 상품이 없습니다."
							: "등록된 쇼핑몰 상품이 없습니다."}
					</div>
				)}
			</div>
			{!isProductLoading && filteredFurnitureList.length > 0 && (
				<div className="shopping-mall-product-pagination">
					<Pagination
						count={pageCount}
						page={page}
						onChange={handlePageChange}
						color="primary"
						shape="rounded"
						showFirstButton
						showLastButton
					/>
				</div>
			)}
			<div className="shopping-mall-product-footer">
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
