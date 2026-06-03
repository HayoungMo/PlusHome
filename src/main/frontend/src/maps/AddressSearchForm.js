import React, { useMemo, useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import DefaultMaps from "./DefaultMaps";
import "../css/AddressSearchForm.css";

const buildCompanyAddress = (baseAddress, detailAddress) => {
	return [baseAddress, detailAddress]
		.filter((value) => value && String(value).trim())
		.join("__");
};

const AddressSearchForm = ({
	form,
	setForm,
	mapHeight = "260px",
	title = "사업체 주소",
	description = "주소 검색 버튼을 눌러 사업체 위치를 검색한 뒤 상세주소를 입력하세요.",
	required = true,
	compact = false,
}) => {
	const addressInputRef = useRef(null);

	const [mapOpen, setMapOpen] = useState(false);
	const [keyword, setKeyword] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [mapCenter, setMapCenter] = useState({
		lat: 37.2635,
		lng: 127.0286,
	});

	const baseAddress = useMemo(() => {
		if (form?.c_addr1) return form.c_addr1;

		if (form?.c_addr) {
			return String(form.c_addr).split("__")[0] || "";
		}

		return "";
	}, [form?.c_addr1, form?.c_addr]);

	const detailAddress = useMemo(() => {
		if (form?.c_addr2) return form.c_addr2;

		if (form?.c_addr?.includes("__")) {
			return String(form.c_addr).split("__").slice(1).join("__");
		}

		return "";
	}, [form?.c_addr2, form?.c_addr]);

	const openMapSearch = () => {
		setMapOpen(true);

		setTimeout(() => {
			addressInputRef.current?.focus?.();
		}, 100);
	};

	const closeMapSearch = () => {
		setMapOpen(false);
		setSearchResults([]);
		setKeyword("");
	};

	const selectAddress = (item) => {
		const selectedAddress = item.roadAddress || item.jibunAddress;

		if (!selectedAddress) return;

		const newLat = parseFloat(item.y);
		const newLng = parseFloat(item.x);

		setForm((prev) => {
			const currentDetail =
				prev?.c_addr2 || prev?.c_addr?.split("__")?.slice(1).join("__") || "";

			return {
				...prev,
				c_addr1: selectedAddress,
				c_addr2: currentDetail,
				c_addr: buildCompanyAddress(selectedAddress, currentDetail),
			};
		});

		if (!Number.isNaN(newLat) && !Number.isNaN(newLng)) {
			setMapCenter({
				lat: newLat,
				lng: newLng,
			});
		}

		setSearchResults([]);
		setKeyword("");
		setMapOpen(false);
	};

	const changeDetailAddress = (evt) => {
		const nextDetailAddress = evt.target.value;

		setForm((prev) => {
			const currentBaseAddress = prev?.c_addr1 || prev?.c_addr?.split("__")?.[0] || "";

			return {
				...prev,
				c_addr2: nextDetailAddress,
				c_addr: buildCompanyAddress(currentBaseAddress, nextDetailAddress),
			};
		});
	};

	const clearAddress = () => {
		setForm((prev) => ({
			...prev,
			c_addr1: "",
			c_addr2: "",
			c_addr: "",
		}));

		setSearchResults([]);
		setKeyword("");
		setMapOpen(false);
	};

	return (
		<div className={`company-address-search${compact ? " compact" : ""}`}>
			<div className="company-address-search-inner">
				{!compact && (
					<div className="company-address-header">
						<div className="company-address-title-area">
							<div className="company-address-title-row">
								<HomeWorkIcon className="company-address-title-icon" />

								<div className="company-address-title">
									{title}
									{required && <span className="company-address-required">*</span>}
								</div>
							</div>

							<p className="company-address-description">{description}</p>
						</div>

						{baseAddress && (
							<div className="company-address-selected-chip">주소 선택됨</div>
						)}
					</div>
				)}

				<div className="company-address-fields">
					<div className="company-address-base-row">
						<TextField
							fullWidth
							size="small"
							label="기본 주소"
							value={baseAddress}
							placeholder="주소 검색 버튼을 눌러 주소를 선택하세요."
							className="company-address-base-field"
							InputProps={{
								readOnly: true,
								startAdornment: (
									<SearchIcon className="company-address-input-icon" />
								),
							}}
						/>

						<Button
							type="button"
							variant={mapOpen ? "outlined" : "contained"}
							color={mapOpen ? "inherit" : "primary"}
							className="company-address-search-toggle-btn"
							onClick={mapOpen ? closeMapSearch : openMapSearch}
						>
							{mapOpen ? "닫기" : baseAddress ? "주소 변경" : "주소 검색"}
						</Button>
					</div>

					<TextField
						fullWidth
						size="small"
						label="상세주소"
						name="c_addr2"
						value={detailAddress}
						onChange={changeDetailAddress}
						placeholder="건물명, 층수, 호수 등을 입력하세요."
						className="company-address-detail-field"
					/>
				</div>

				{mapOpen && (
					<div className="company-address-map-area">
						<div className="company-address-map-box">
							<DefaultMaps
								keyword={keyword}
								setSearchResults={setSearchResults}
								setKeyword={setKeyword}
								center={mapCenter}
								height={mapHeight}
								inputRef={addressInputRef}
								layout="stacked"
							/>
						</div>

						{searchResults.length > 0 && (
							<div className="company-address-result-box">
								{searchResults.map((item, index) => {
									const roadAddress = item.roadAddress;
									const jibunAddress = item.jibunAddress;
									const mainAddress = roadAddress || jibunAddress;
									const subAddress =
										roadAddress && jibunAddress ? jibunAddress : "";

									return (
										<button
											type="button"
											key={`${roadAddress || ""}-${jibunAddress || ""}-${index}`}
											className="company-address-result-item"
											onClick={() => selectAddress(item)}
										>
											<div className="company-address-result-content">
												<LocationOnIcon className="company-address-result-icon" />

												<div className="company-address-result-text">
													<strong className="company-address-result-main">
														{mainAddress}
													</strong>

													{subAddress && (
														<span className="company-address-result-sub">
															지번: {subAddress}
														</span>
													)}
												</div>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				)}

				{!compact && (
					<div className="company-address-bottom">
						<p className="company-address-save-guide">
							주소는 <strong>기본주소 + 상세주소</strong>로 저장됩니다.
						</p>

						{(baseAddress || detailAddress) && (
							<Button
								type="button"
								size="small"
								color="inherit"
								variant="outlined"
								className="company-address-clear-btn"
								onClick={clearAddress}
							>
								주소 초기화
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AddressSearchForm;
