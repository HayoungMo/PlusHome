import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip } from "@mui/material";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TextFieldMui from "../components/TextFieldMui";
import TableMui from "../components/TableMui";
import CompanyService from "../service/companyService";
import ImageService from "../service/imageService";
import GetImgDir, { getImgDirSimple } from "../resources/function/GetImgDir";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";
import AddressSearchForm from "../maps/AddressSearchForm";
import UserPageService from "../service/userPageService";

const makeCompanyKey = (row) => {
	if (!row) return "";
	return `${row.c_id}__${row.c_name}__${row.c_kind}`;
};

const getChangedCompanyPayload = (origin, edited) => {
	if (!origin || !edited) return null;

	const changedFields = {};
	Object.keys(edited).forEach((key) => {
		if (["rowIndex", "c_addr1", "c_addr2"].includes(key)) return;
		if (edited[key] !== origin[key]) {
			changedFields[key] = edited[key];
		}
	});

	if (Object.keys(changedFields).length === 0) return null;

	return {
		c_id: origin.c_id,
		c_name: origin.c_name,
		c_kind: origin.c_kind,
		...changedFields,
	};
};

const COMPANY_ADDRESS_SEPARATOR = "__";

const parseCompanyAddress = (address) => {
	if (!address) return { c_addr1: "", c_addr2: "" };

	const [baseAddress = "", ...detailParts] = String(address).split(COMPANY_ADDRESS_SEPARATOR);

	return {
		c_addr1: baseAddress,
		c_addr2: detailParts.join(COMPANY_ADDRESS_SEPARATOR),
	};
};

const buildCompanyAddress = (baseAddress, detailAddress) => {
	return [baseAddress, detailAddress]
		.filter((value) => value && String(value).trim())
		.join(COMPANY_ADDRESS_SEPARATOR);
};

const formatAddress = (address) => {
	if (!address) return "";
	const { c_addr1, c_addr2 } = parseCompanyAddress(address);
	return [c_addr1, c_addr2].filter(Boolean).join(" ");
};

// const removeUnderBar = (address) => {if (!address) return "";return address.replace(/__(.*)/, " ( $1 ) ");};

const createCompanyFormFromRow = (row, fallbackInfo) => {
	const source = row || fallbackInfo;
	return {
		...fallbackInfo,
		...source,
		...parseCompanyAddress(source?.c_addr),
	};
};

const isValidCompanyRow = (row) => {
	return !!(row?.c_id && row?.c_name && row?.c_kind);
};

const companyTypeOptions = [
	{
		value: "shop",
		title: "쇼핑몰",
		description: "온라인 쇼핑몰 운영 업체",
		Icon: StorefrontOutlinedIcon,
	},
	{
		value: "interior",
		title: "인테리어",
		description: "인테리어 시공 및 디자인 업체",
		Icon: ApartmentOutlinedIcon,
	},
];

const CompanyInfo = ({ companyAddInfo, setCompanyAddInfo, refreshUserData }) => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData || "{}");
	const {
		id = "",
		name = "",
		addr = "",
		tel = "",
		email = "",
		companyList: initialCompanyList = [],
	} = userData;

	const initCompanyInfo = {
		c_id: id,
		c_name: "",
		c_kind: "",
		c_tel: "",
		c_addr: "",
		c_addr1: "",
		c_addr2: "",
		c_info: "",
		c_boss: "",
	};

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	const [companyList, setCompanyList] = useState(initialCompanyList);
	const [imageList, setImageList] = useState([]);
	const [imageVersion, setImageVersion] = useState(0);
	const [profileImage, setProfileImage] = useState(null);

	const [tabValue, setTabValue] = useState("all");
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [editForm, setEditForm] = useState(initCompanyInfo);
	const [isEditing, setIsEditing] = useState(false);

	const [addForm, setAddForm] = useState(initCompanyInfo);
	const [addLogoFile, setAddLogoFile] = useState(null);
	const [addLogoPreview, setAddLogoPreview] = useState(null);

	const [updateLogoFile, setUpdateLogoFile] = useState(null);
	const [updateLogoPreview, setUpdateLogoPreview] = useState(null);

	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const companyAdd = companyAddInfo?.open;

	const showAlert = ({ severity, title, text }) => {
		setAlertInfo({ severity, title, text });
		setAlertOpen(true);
	};

	const applyFallbackCompanyList = () => {
		const latestUserData = JSON.parse(localStorage.getItem("user") || "{}");
		const fallbackCompanyList = latestUserData.companyList || [];

		setCompanyList(fallbackCompanyList);
		setSelectedCompany((prev) => {
			if (!prev) return null;

			const refreshedSelected = fallbackCompanyList.find(
				(row) => makeCompanyKey(row) === makeCompanyKey(prev),
			);

			return refreshedSelected || null;
		});

		return fallbackCompanyList;
	};

	const reloadDataFunc = async () => {
		if (!id) return { success: false, companyList: [] };

		try {
			const response = await CompanyService.reloadUserData(id);

			if (response.status === 200) {
				const { user, token } = response.data;

				if (!user) return;

				const serverCompanyList = user.companyList || [];
				const listWithImages = await Promise.all(
					serverCompanyList.map(async (item) => {
						const logo = await GetImgDir({
							kind: "LOGO",
							returnType: "list",
							a: item.c_id,
							b: item.c_kind,
							c: item.c_name,
							d: "Logo",
							view: false,
						});

						return logo;
					}),
				);

				setImageList(listWithImages);
				setCompanyList(serverCompanyList);
				localStorage.setItem("user", JSON.stringify(user));

				if (token) {
					localStorage.setItem("token", token);
				}

				refreshUserData?.();

				setSelectedCompany((prev) => {
					if (!prev) return null;

					const refreshedSelected = serverCompanyList.find(
						(row) => makeCompanyKey(row) === makeCompanyKey(prev),
					);

					return refreshedSelected || null;
				});

				return { success: true, companyList: serverCompanyList };
			}

			return { success: false, companyList: [] };
		} catch (error) {
			const fallbackCompanyList = applyFallbackCompanyList();
			showAlert({
				severity: "error",
				title: "데이터 갱신 실패",
				text: String(error),
			});
			return { success: false, companyList: fallbackCompanyList };
		}
	};

	const selectedCompanyDetail = useMemo(() => {
		if (!isValidCompanyRow(selectedCompany)) return null;

		return (
			companyList.find(
				(company) => makeCompanyKey(company) === makeCompanyKey(selectedCompany),
			) || selectedCompany
		);
	}, [companyList, selectedCompany]);

	const selectedImage = useMemo(() => {
		return imageList
			?.flatMap((logo) => logo?.result || [])
			.find(
				(item) =>
					String(item.dir_a) === String(selectedCompanyDetail?.c_id) &&
					item.dir_b === selectedCompanyDetail?.c_kind &&
					item.dir_c === selectedCompanyDetail?.c_name,
			);
	}, [imageList, selectedCompanyDetail]);

	const selectedLogoSrc = useMemo(() => {
		if (updateLogoPreview) return updateLogoPreview;
		return selectedImage ? `${selectedImage.img_name}?v=${imageVersion}` : "";
	}, [selectedImage, updateLogoPreview, imageVersion]);
	const accountProfileImageSrc = profileImage?.img_name
		? getImgDirSimple({
				kind: profileImage.img_kind,
				name: profileImage.img_name,
			})
		: "";

	const filteredCompanyList = useMemo(() => {
		const baseList =
			tabValue === "all"
				? companyList
				: companyList.filter((company) => company.c_kind === tabValue);

		return baseList.map((company) => ({
			...company,
			c_addr_display: formatAddress(company.c_addr) || "-",
		}));
	}, [companyList, tabValue]);

	const shopCount = companyList?.filter((company) => company.c_kind === "shop").length ?? 0;
	const interiorCount =
		companyList?.filter((company) => company.c_kind === "interior").length ?? 0;
	const accountStats = [
		{
			label: "등록 사업체",
			value: `${companyList?.length ?? 0}개`,
			Icon: AssignmentOutlinedIcon,
		},
		{
			label: "쇼핑몰",
			value: `${shopCount}개`,
			Icon: StorefrontOutlinedIcon,
		},
		{
			label: "인테리어",
			value: `${interiorCount}개`,
			Icon: ApartmentOutlinedIcon,
		},
	];
	const accountInfoRows = [
		{ label: "아이디", value: id || "-", Icon: PersonOutlinedIcon },
		{ label: "이름", value: name || "-", Icon: PersonOutlinedIcon },
		{ label: "개인연락처", value: tel || "-", Icon: PhoneOutlinedIcon },
		{ label: "이메일", value: email || "-", Icon: EmailOutlinedIcon },
	];
	const addCompanyType = companyTypeOptions.find((option) => option.value === addForm.c_kind);
	const addPreviewName = addForm.c_name?.trim() || "업체명을 입력하세요";
	const addPreviewInfo = addForm.c_info?.trim() || "소개를 입력해 주세요";
	const addPreviewTel = addForm.c_tel?.trim() || "전화번호를 입력하세요";
	const editCompanyType = companyTypeOptions.find((option) => option.value === editForm.c_kind);
	const editPreviewName = editForm.c_name?.trim() || "업체명을 입력하세요";
	const editPreviewInfo = editForm.c_info?.trim() || "소개를 입력해 주세요";
	const editPreviewTel = editForm.c_tel?.trim() || "전화번호를 입력하세요";
	const editPreviewLogo = updateLogoPreview || selectedLogoSrc;
	const selectedCompanyType = companyTypeOptions.find(
		(option) => option.value === selectedCompanyDetail?.c_kind,
	);
	const selectedCompanyKindLabel =
		selectedCompanyType?.title || selectedCompanyDetail?.c_kind || "업체 구분 없음";
	const selectedCompanyAddress = formatAddress(selectedCompanyDetail?.c_addr) || "주소 정보 없음";
	const selectedCompanyTel = selectedCompanyDetail?.c_tel || "전화번호 정보 없음";
	const selectedCompanyBoss = selectedCompanyDetail?.c_boss || "대표자 정보 없음";
	const selectedCompanyIntro = selectedCompanyDetail?.c_info || "등록된 소개가 없습니다.";

	const resetAddForm = (kind = "") => {
		setAddForm({ ...initCompanyInfo, c_kind: kind });
		setAddLogoFile(null);
		setAddLogoPreview(null);
	};

	const resetUpdateLogo = () => {
		setUpdateLogoFile(null);
		setUpdateLogoPreview(null);
	};

	const handleTabChange = (kind) => {
		setTabValue(kind);
		setIsEditing(false);
		resetUpdateLogo();
		setSelectedCompany(null);
	};

	const handleSelectCompany = (row) => {
		setSelectedCompany(isValidCompanyRow(row) ? row : null);
		setIsEditing(false);
		resetUpdateLogo();
	};

	const handleEditFormChange = (e) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddFormChange = (e) => {
		const { name, value } = e.target;
		setAddForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddKindSelect = (kind) => {
		setAddForm((prev) => ({ ...prev, c_kind: kind }));
	};

	const handleAddLogoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (addLogoPreview) URL.revokeObjectURL(addLogoPreview);

		setAddLogoFile(file);
		setAddLogoPreview(URL.createObjectURL(file));
		e.target.value = "";
	};

	const handleUpdateLogoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (updateLogoPreview) URL.revokeObjectURL(updateLogoPreview);

		setUpdateLogoFile(file);
		setUpdateLogoPreview(URL.createObjectURL(file));
		e.target.value = "";
	};

	const insertCompanyLogo = async (company, file) => {
		if (!company || !file) return null;

		const result = await ImageService.insertImage([
			{
				img_kind: "LOGO",
				img_tag: "LOGO",
				dir_a: company.c_id,
				dir_b: company.c_kind,
				dir_c: company.c_name,
				dir_d: "Logo",
				img_idx: 0,
				file,
			},
		]);

		return result;
	};

	const updateCompanyLogo = async () => {
		if (!selectedCompanyDetail || !updateLogoFile) return null;

		if (selectedImage?.img_originalName) {
			return ImageService.updateImage([
				{
					file: updateLogoFile,
					name: selectedImage.img_originalName,
				},
			]);
		}

		return insertCompanyLogo(selectedCompanyDetail, updateLogoFile);
	};

	const validateCompanyForm = (form, mode = "create", options = {}) => {
		const { hasLogo = false } = options;

		if (!form.c_name?.trim()) return "업체명을 입력하세요.";
		if (!form.c_kind) return "업체 구분을 선택하세요.";
		if (!form.c_tel?.trim()) return "전화번호를 입력하세요.";
		if (!form.c_addr?.trim()) return "주소를 입력하세요.";

		if (mode === "create") {
			if (!form.c_addr1?.trim()) return "지도에서 주소를 선택하세요.";
			if (!form.c_addr2?.trim()) return "상세주소를 입력하세요.";
		}

		if (!form.c_boss?.trim()) return "대표자명을 입력하세요.";
		if (!form.c_info?.trim()) return "소개를 입력하세요.";
		if (!hasLogo) return "로고 이미지를 등록하세요.";
		return "";
	};

	const handleAddCompany = async () => {
		const nextAddress = buildCompanyAddress(addForm.c_addr1, addForm.c_addr2);
		const nextAddForm = {
			...addForm,
			c_addr: nextAddress || addForm.c_addr,
		};
		const validationMessage = validateCompanyForm(nextAddForm, "create", {
			hasLogo: !!addLogoFile,
		});
		if (validationMessage) {
			showAlert({ severity: "warning", title: "입력 확인", text: validationMessage });
			return;
		}

		const insertPayload = {
			c_id: nextAddForm.c_id,
			c_name: nextAddForm.c_name,
			c_kind: nextAddForm.c_kind,
			c_tel: nextAddForm.c_tel,
			c_addr: nextAddForm.c_addr,
			c_info: nextAddForm.c_info,
			c_boss: nextAddForm.c_boss,
		};

		try {
			await CompanyService.insertCompany(insertPayload);
			let logoError = null;

			if (addLogoFile) {
				try {
					await insertCompanyLogo(insertPayload, addLogoFile);
				} catch (error) {
					logoError = error;
				}
			}

			const reloadResult = await reloadDataFunc();
			if (!reloadResult.success) return;

			setCompanyAddInfo?.({ open: false, type: nextAddForm.c_kind });
			resetAddForm();
			setTabValue(nextAddForm.c_kind || "all");
			setSelectedCompany(
				reloadResult.companyList.find(
					(company) => makeCompanyKey(company) === makeCompanyKey(insertPayload),
				) ||
					reloadResult.companyList[0] ||
					null,
			);

			if (logoError) {
				showAlert({
					severity: "warning",
					title: "등록 일부 완료",
					text: `업체 정보는 등록되었지만 로고 등록에 실패했습니다. ${String(logoError)}`,
				});
			} else {
				showAlert({
					severity: "success",
					title: "등록 성공",
					text: "업체 정보가 등록되었습니다.",
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "등록 실패",
				text: String(error),
			});
		}
	};

	const handleSaveCompany = async () => {
		if (!selectedCompanyDetail) {
			showAlert({
				severity: "warning",
				title: "선택 확인",
				text: "수정할 업체를 선택하세요.",
			});
			return;
		}

		const nextAddress = buildCompanyAddress(editForm.c_addr1, editForm.c_addr2);
		const nextEditForm = {
			...editForm,
			c_addr: nextAddress || editForm.c_addr,
		};
		const validationMessage = validateCompanyForm(nextEditForm, "edit", {
			hasLogo: !!selectedLogoSrc || !!updateLogoFile,
		});
		if (validationMessage) {
			showAlert({ severity: "warning", title: "입력 확인", text: validationMessage });
			setSaveConfirmOpen(false);
			return;
		}

		try {
			const changedPayload = getChangedCompanyPayload(selectedCompanyDetail, nextEditForm);
			let result = { success: true, message: "수정되었습니다." };

			if (changedPayload) {
				result = await CompanyService.updateCompany([changedPayload]);
			}

			if (result?.success === false) {
				showAlert({
					severity: "error",
					title: "수정 실패",
					text: result.message,
				});
				setSaveConfirmOpen(false);
				return;
			}

			let logoError = null;
			if (updateLogoFile) {
				try {
					const imageResult = await updateCompanyLogo();
					if (imageResult?.success === false || imageResult?.data?.success === false) {
						logoError = new Error(
							imageResult?.message ||
								imageResult?.data?.message ||
								"Logo update failed",
						);
					}
				} catch (error) {
					logoError = error;
				}
			}

			const reloadResult = await reloadDataFunc();
			if (!reloadResult.success) {
				setSaveConfirmOpen(false);
				return;
			}

			setImageVersion((prev) => prev + 1);
			setIsEditing(false);
			resetUpdateLogo();
			setSaveConfirmOpen(false);

			if (logoError) {
				showAlert({
					severity: "warning",
					title: "수정 일부 완료",
					text: `업체 정보는 수정되었지만 로고 변경에 실패했습니다. ${String(logoError)}`,
				});
			} else {
				showAlert({
					severity: "success",
					title: "수정 성공",
					text: result.message || "업체 정보가 수정되었습니다.",
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "수정 실패",
				text: String(error),
			});
			setSaveConfirmOpen(false);
		}
	};

	const handleDeleteCompany = async () => {
		if (!selectedCompanyDetail) {
			showAlert({
				severity: "warning",
				title: "선택 확인",
				text: "삭제할 업체를 선택하세요.",
			});
			return;
		}

		try {
			const deletePayload = { ...selectedCompanyDetail };
			delete deletePayload.rowIndex;
			const result = await CompanyService.deleteCompany([deletePayload]);

			if (result.success) {
				const reloadResult = await reloadDataFunc();
				if (!reloadResult.success) {
					setDeleteConfirmOpen(false);
					return;
				}

				setIsEditing(false);
				resetUpdateLogo();
				showAlert({
					severity: "success",
					title: "삭제 성공",
					text: result.message,
				});
			} else {
				showAlert({
					severity: "error",
					title: "삭제 실패",
					text: result.message,
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "삭제 실패",
				text: String(error),
			});
		}

		setDeleteConfirmOpen(false);
	};

	const startEdit = () => {
		if (!selectedCompanyDetail) {
			showAlert({
				severity: "warning",
				title: "선택 확인",
				text: "수정할 업체를 선택하세요.",
			});
			return;
		}

		setCompanyAddInfo?.({ open: false, type: "" });
		resetAddForm();
		setEditForm(createCompanyFormFromRow(selectedCompanyDetail, initCompanyInfo));
		resetUpdateLogo();
		setIsEditing(true);
	};

	const cancelEdit = () => {
		setEditForm(
			selectedCompanyDetail
				? createCompanyFormFromRow(selectedCompanyDetail, initCompanyInfo)
				: initCompanyInfo,
		);
		resetUpdateLogo();
		setIsEditing(false);
	};

	const openAddPanel = (kind = "") => {
		setIsEditing(false);
		setSaveConfirmOpen(false);
		resetUpdateLogo();
		setCompanyAddInfo?.({ open: true, type: kind });
		resetAddForm(kind);
	};

	const closeAddPanel = () => {
		setCompanyAddInfo?.({ open: false, type: "" });
		resetAddForm();
	};

	useEffect(() => {
		reloadDataFunc();
	}, [id]);

	useEffect(() => {
		let ignore = false;

		const loadProfileImage = async () => {
			try {
				const response = await UserPageService.getProfileImage();
				if (!ignore) {
					setProfileImage(response?.data || null);
				}
			} catch (error) {
				if (!ignore) {
					setProfileImage(null);
				}
			}
		};

		loadProfileImage();

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		if (!selectedCompanyDetail) {
			setEditForm(initCompanyInfo);
			return;
		}

		setEditForm(createCompanyFormFromRow(selectedCompanyDetail, initCompanyInfo));
	}, [selectedCompanyDetail]);

	useEffect(() => {
		if (companyAddInfo?.open) {
			resetAddForm(companyAddInfo.type || "");
			if (companyAddInfo.type) setTabValue(companyAddInfo.type);
		}
	}, [companyAddInfo]);

	useEffect(() => {
		return () => {
			if (addLogoPreview) URL.revokeObjectURL(addLogoPreview);
			if (updateLogoPreview) URL.revokeObjectURL(updateLogoPreview);
		};
	}, [addLogoPreview, updateLogoPreview]);

	return (
		<div className="dashboard-company-page">
			<section className="dashboard-company-header">
				<div>
					<h3>내 사업체 관리</h3>
					<p>등록된 사업체 정보와 로고를 관리합니다.</p>
				</div>
				<div className="dashboard-company-summary">
					<Chip label={`전체 ${companyList?.length ?? 0}개`} variant="outlined" />
					<Chip label={`쇼핑몰 ${shopCount}개`} color="primary" variant="outlined" />
					<Chip
						label={`인테리어 ${interiorCount}개`}
						color="secondary"
						variant="outlined"
					/>
				</div>
			</section>

			<section className="dashboard-company-card dashboard-company-account-card">
				<div className="dashboard-company-card-head dashboard-company-account-head">
					<strong>계정 정보</strong>
					<span>로그인한 기업 회원의 기본 정보입니다.</span>
				</div>
				<div className="dashboard-company-account-grid">
					<aside className="company-account-profile-card">
						<div className="company-account-avatar">
							{accountProfileImageSrc ? (
								<img src={accountProfileImageSrc} alt="계정 프로필" />
							) : (
								<PersonOutlinedIcon />
							)}
						</div>
						<span className="company-account-badge">기업 회원</span>

						<div className="company-account-stat-list">
							{accountStats.map(({ label, value, Icon }) => (
								<div className="company-account-stat" key={label}>
									<span className="company-account-stat-icon">
										<Icon />
									</span>
									<p>{label}</p>
									<strong>{value}</strong>
								</div>
							))}
						</div>
					</aside>

					<div className="company-account-info-panel">
						<div className="company-account-info-list">
							{accountInfoRows.map(({ label, value, Icon }) => (
								<div className="company-account-info-row" key={label}>
									<span className="company-account-info-icon">
										<Icon />
									</span>
									<strong>{label}</strong>
									<p>{value}</p>
								</div>
							))}
						</div>

						<div className="company-account-address-box">
							<span className="company-account-info-icon">
								<LocationOnOutlinedIcon />
							</span>
							<div>
								<strong>개인주소</strong>
								<p>{formatAddress(addr) || "-"}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="dashboard-company-card">
				<div className="dashboard-company-card-head">
					<strong>사업체 목록</strong>
					<span>사업체를 선택하면 상세 정보 관리 영역이 열립니다.</span>
				</div>
				<div className="dashboard-company-toolbar">
					<Button
						variant={tabValue === "all" ? "contained" : "outlined"}
						onClick={() => handleTabChange("all")}>
						전체
					</Button>
					<Button
						variant={tabValue === "shop" ? "contained" : "outlined"}
						onClick={() => handleTabChange("shop")}>
						쇼핑몰
					</Button>
					<Button
						variant={tabValue === "interior" ? "contained" : "outlined"}
						onClick={() => handleTabChange("interior")}>
						인테리어
					</Button>
					<Button
						className="dashboard-company-add-button"
						color="success"
						variant="contained"
						onClick={() => openAddPanel(tabValue === "all" ? "" : tabValue)}>
						사업체 등록
					</Button>
				</div>

				{filteredCompanyList.length > 0 ? (
					<div className="dashboard-company-table">
						<TableMui
							rowData={filteredCompanyList}
							col={["c_name", "c_kind", "c_tel", "c_addr_display", "c_boss"]}
							columns={["업체명", "구분", "연락처", "주소", "대표자"]}
							selectedRow={selectedCompany}
							setSelectedRow={handleSelectCompany}
						/>
					</div>
				) : (
					<div className="dashboard-company-empty">
						<p>등록된 사업체 데이터가 없습니다.</p>
						<Button
							variant="contained"
							onClick={() => openAddPanel(tabValue === "all" ? "" : tabValue)}>
							등록하기
						</Button>
					</div>
				)}
			</section>

			<section className="dashboard-company-card dashboard-company-detail-card">
				<div className="dashboard-company-card-head">
					<div>
						<strong>선택 사업체 상세</strong>
						<span>연락처, 주소, 소개, 대표자명과 로고를 관리합니다.</span>
					</div>
					{selectedCompanyDetail && !isEditing && (
						<div className="dashboard-company-detail-head-actions">
							<Button color="primary" variant="contained" onClick={startEdit}>
								수정
							</Button>
							<Button
								color="error"
								variant="contained"
								onClick={() => setDeleteConfirmOpen(true)}>
								삭제
							</Button>
						</div>
					)}
				</div>
				{selectedCompanyDetail ? (
					<div className="dashboard-company-detail">
						{isEditing ? (
							<div className="dashboard-company-edit-shell">
								<div className="dashboard-company-create-layout">
									<div className="dashboard-company-create-main">
										<section className="dashboard-company-create-section">
											<div className="dashboard-company-create-section-title">
												기본 정보
											</div>

											<div className="dashboard-company-create-form">
												<div className="company-create-field full">
													<TextFieldMui
														name="c_name"
														label="업체명"
														value={editForm.c_name || ""}
														disabled
														width="100%"
													/>
												</div>

												<div className="company-create-field full">
													<div className="company-create-label">
														업체 구분 <span>*</span>
													</div>
													<div className="company-type-card-group">
														{companyTypeOptions.map(
															({
																value,
																title,
																description,
																Icon,
															}) => (
																<button
																	type="button"
																	key={value}
																	disabled
																	className={`company-type-card readonly${
																		editForm.c_kind === value
																			? " selected"
																			: ""
																	}`}>
																	<span className="company-type-icon">
																		<Icon />
																	</span>
																	<span className="company-type-text">
																		<strong>{title}</strong>
																		<em>{description}</em>
																	</span>
																	<span className="company-type-check" />
																</button>
															),
														)}
													</div>
												</div>

												<div className="company-create-field">
													<TextFieldMui
														name="c_tel"
														label="전화번호"
														value={editForm.c_tel || ""}
														onChange={handleEditFormChange}
														width="100%"
													/>
												</div>

												<div className="company-create-field">
													<TextFieldMui
														name="c_boss"
														label="대표자명"
														value={editForm.c_boss || ""}
														onChange={handleEditFormChange}
														width="100%"
													/>
												</div>

												<div className="company-create-field full">
													<div className="company-create-label">
														주소 <span>*</span>
													</div>
													<AddressSearchForm
														form={editForm}
														setForm={setEditForm}
														mapHeight="260px"
														compact
													/>
												</div>
											</div>
										</section>

										<section className="dashboard-company-create-section">
											<div className="dashboard-company-create-section-title">
												업체 소개 및 로고
											</div>

											<div className="dashboard-company-create-form">
												<div className="company-create-field full">
													<TextFieldMui
														name="c_info"
														label="소개"
														value={editForm.c_info || ""}
														onChange={handleEditFormChange}
														multiline
														rows={4}
														width="100%"
													/>
													<div className="company-create-counter">
														{(editForm.c_info || "").length} / 500
													</div>
												</div>

												<div className="company-create-field full">
													<Button
														variant="outlined"
														component="label"
														className="company-logo-dropzone">
														{editPreviewLogo ? (
															<img
																src={editPreviewLogo}
																alt="업체 로고 미리보기"
															/>
														) : (
															<span className="company-logo-dropzone-empty">
																<CloudUploadIcon />
																<strong>
																	이미지를 드래그하거나 클릭하여
																	업로드하세요.
																</strong>
																<em>JPG, PNG · 최대 5MB</em>
															</span>
														)}
														<input
															type="file"
															hidden
															onChange={handleUpdateLogoChange}
														/>
													</Button>
												</div>
											</div>
										</section>
									</div>

									<aside className="dashboard-company-create-preview-card">
										<div className="dashboard-company-create-section-title">
											수정 미리보기
										</div>
										<div className="company-preview-card">
											<div className="company-preview-logo">
												{editPreviewLogo ? (
													<img
														src={editPreviewLogo}
														alt="업체 로고 미리보기"
													/>
												) : (
													<ApartmentOutlinedIcon />
												)}
											</div>
											<strong className="company-preview-name">
												{editPreviewName}
											</strong>
											<span className="company-preview-kind">
												{editCompanyType
													? `${editCompanyType.title} 업체`
													: "업체 구분 선택"}
											</span>
											<div className="company-preview-divider" />
											<div className="company-preview-info">
												<span>소개</span>
												<p>{editPreviewInfo}</p>
											</div>
											<div className="company-preview-divider" />
											<div className="company-preview-info">
												<span>전화번호</span>
												<p>{editPreviewTel}</p>
											</div>
										</div>
										<div className="company-preview-note">
											업체명과 업체 구분은 기존 데이터 기준으로 유지됩니다.
										</div>
									</aside>
								</div>

								<div className="dashboard-company-create-footer">
									<Button color="inherit" variant="outlined" onClick={cancelEdit}>
										취소
									</Button>
									<Button
										color="primary"
										variant="contained"
										onClick={() => setSaveConfirmOpen(true)}>
										저장
									</Button>
								</div>
							</div>
						) : (
							<>
								<div className="dashboard-company-detail-read">
									<div className="company-detail-hero">
										<div className="company-detail-logo-frame">
											{selectedLogoSrc ? (
												<img src={selectedLogoSrc} alt="업체 로고" />
											) : (
												<div className="company-detail-logo-placeholder">
													<ApartmentOutlinedIcon />
													<span>Logo</span>
												</div>
											)}
										</div>

										<div className="company-detail-hero-content">
											<div className="company-detail-title-row">
												<strong>{selectedCompanyDetail.c_name}</strong>
												<span>{selectedCompanyKindLabel}</span>
											</div>
											<div className="company-detail-meta company-detail-address">
												<LocationOnOutlinedIcon />
												<p>{selectedCompanyAddress}</p>
											</div>
											<div className="company-detail-meta-group">
												<div className="company-detail-meta">
													<PhoneOutlinedIcon />
													<p>{selectedCompanyTel}</p>
												</div>
												<div className="company-detail-meta divider">
													<PersonOutlinedIcon />
													<p>대표자명: {selectedCompanyBoss}</p>
												</div>
											</div>
										</div>
									</div>

									<div className="company-detail-info-grid">
										<section className="company-detail-panel">
											<div className="company-detail-panel-title">
												<AssignmentOutlinedIcon />
												<strong>기본 정보</strong>
											</div>
											<div className="company-detail-row">
												<span className="company-detail-row-icon">
													<PhoneOutlinedIcon />
												</span>
												<strong>전화번호</strong>
												<p>{selectedCompanyTel}</p>
											</div>
											<div className="company-detail-row">
												<span className="company-detail-row-icon">
													<LocationOnOutlinedIcon />
												</span>
												<strong>주소</strong>
												<p>{selectedCompanyAddress}</p>
											</div>
											<div className="company-detail-row">
												<span className="company-detail-row-icon">
													<PersonOutlinedIcon />
												</span>
												<strong>대표자명</strong>
												<p>{selectedCompanyBoss}</p>
											</div>
										</section>

										<section className="company-detail-panel company-detail-intro-panel">
											<div className="company-detail-panel-title">
												<ArticleOutlinedIcon />
												<strong>업체 소개</strong>
											</div>
											<div className="company-detail-intro-box">
												{selectedCompanyIntro}
											</div>
										</section>
									</div>
								</div>
							</>
						)}
					</div>
				) : (
					<p className="dashboard-company-guide">
						{companyList.length > 0
							? "회사를 선택하면 상세 정보가 표시됩니다."
							: "등록된 사업체 데이터가 없습니다."}
					</p>
				)}
			</section>

			{companyAdd && (
				<section className="dashboard-company-create-shell">
					<div className="dashboard-company-create-head">
						<div>
							<strong>사업체 등록</strong>
							<span>새로운 쇼핑몰 또는 인테리어 업체 정보를 등록합니다.</span>
						</div>
					</div>

					<div className="dashboard-company-create-layout">
						<div className="dashboard-company-create-main">
							<section className="dashboard-company-create-section">
								<div className="dashboard-company-create-section-title">
									기본 정보
								</div>

								<div className="dashboard-company-create-form">
									<div className="company-create-field full">
										<TextFieldMui
											onChange={handleAddFormChange}
											name="c_name"
											label="업체명"
											value={addForm.c_name || ""}
											width="100%"
										/>
									</div>

									<div className="company-create-field full">
										<div className="company-create-label">
											업체 구분 <span>*</span>
										</div>
										<div className="company-type-card-group">
											{companyTypeOptions.map(
												({ value, title, description, Icon }) => (
													<button
														type="button"
														key={value}
														className={`company-type-card${
															addForm.c_kind === value
																? " selected"
																: ""
														}`}
														onClick={() => handleAddKindSelect(value)}>
														<span className="company-type-icon">
															<Icon />
														</span>
														<span className="company-type-text">
															<strong>{title}</strong>
															<em>{description}</em>
														</span>
														<span className="company-type-check" />
													</button>
												),
											)}
										</div>
									</div>

									<div className="company-create-field">
										<TextFieldMui
											onChange={handleAddFormChange}
											name="c_tel"
											label="전화번호"
											value={addForm.c_tel || ""}
											width="100%"
										/>
									</div>

									<div className="company-create-field">
										<TextFieldMui
											onChange={handleAddFormChange}
											name="c_boss"
											label="대표자명"
											value={addForm.c_boss || ""}
											width="100%"
										/>
									</div>

									<div className="company-create-field full">
										<div className="company-create-label">
											주소 <span>*</span>
										</div>
										<AddressSearchForm
											form={addForm}
											setForm={setAddForm}
											mapHeight="260px"
											compact
										/>
									</div>
								</div>
							</section>

							<section className="dashboard-company-create-section">
								<div className="dashboard-company-create-section-title">
									업체 소개 및 로고
								</div>

								<div className="dashboard-company-create-form">
									<div className="company-create-field full">
										<TextFieldMui
											onChange={handleAddFormChange}
											name="c_info"
											label="소개"
											value={addForm.c_info || ""}
											multiline
											rows={4}
											width="100%"
										/>
										<div className="company-create-counter">
											{(addForm.c_info || "").length} / 500
										</div>
									</div>

									<div className="company-create-field full">
										<Button
											variant="outlined"
											component="label"
											className="company-logo-dropzone">
											{addLogoPreview ? (
												<img
													src={addLogoPreview}
													alt="업체 로고 미리보기"
												/>
											) : (
												<span className="company-logo-dropzone-empty">
													<CloudUploadIcon />
													<strong>
														이미지를 드래그하거나 클릭하여 업로드하세요.
													</strong>
													<em>JPG, PNG · 최대 5MB</em>
												</span>
											)}
											<input
												type="file"
												hidden
												name="logoFileInput"
												onChange={handleAddLogoChange}
											/>
										</Button>
									</div>
								</div>
							</section>
						</div>

						<aside className="dashboard-company-create-preview-card">
							<div className="dashboard-company-create-section-title">
								등록 미리보기
							</div>
							<div className="company-preview-card">
								<div className="company-preview-logo">
									{addLogoPreview ? (
										<img src={addLogoPreview} alt="업체 로고 미리보기" />
									) : (
										<ApartmentOutlinedIcon />
									)}
								</div>
								<strong className="company-preview-name">{addPreviewName}</strong>
								<span className="company-preview-kind">
									{addCompanyType
										? `${addCompanyType.title} 업체`
										: "업체 구분 선택"}
								</span>
								<div className="company-preview-divider" />
								<div className="company-preview-info">
									<span>소개</span>
									<p>{addPreviewInfo}</p>
								</div>
								<div className="company-preview-divider" />
								<div className="company-preview-info">
									<span>전화번호</span>
									<p>{addPreviewTel}</p>
								</div>
							</div>
							<div className="company-preview-note">
								입력한 내용은 저장 전까지 미리보기로만 표시됩니다.
							</div>
						</aside>
					</div>

					<div className="dashboard-company-create-footer">
						<Button color="inherit" variant="outlined" onClick={closeAddPanel}>
							취소
						</Button>
						<Button variant="contained" color="primary" onClick={handleAddCompany}>
							사업체 등록
						</Button>
					</div>
				</section>
			)}

			{saveConfirmOpen && (
				<DialogMui
					open={saveConfirmOpen}
					onClose={() => setSaveConfirmOpen(false)}
					title="변경사항 저장"
					text="선택한 사업체 정보를 저장하시겠습니까?"
					buttons={[
						{
							title: "Cancel",
							color: "error",
							variant: "outlined",
							onClick: () => setSaveConfirmOpen(false),
						},
						{
							title: "Save",
							color: "primary",
							variant: "outlined",
							onClick: handleSaveCompany,
						},
					]}
				/>
			)}
			{deleteConfirmOpen && (
				<DialogMui
					open={deleteConfirmOpen}
					onClose={() => setDeleteConfirmOpen(false)}
					title="사업체 삭제"
					text="선택한 사업체를 삭제하시겠습니까? 삭제한 데이터는 복구할 수 없습니다."
					buttons={[
						{
							title: "Cancel",
							color: "error",
							variant: "outlined",
							onClick: () => setDeleteConfirmOpen(false),
						},
						{
							title: "Delete",
							color: "primary",
							variant: "outlined",
							onClick: handleDeleteCompany,
						},
					]}
				/>
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

export default CompanyInfo;
