import React, { useState } from "react";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CouponService from "../service/couponService";

const CouponDownDev = (data) => {
	const { selectedUserKeys, selectedCouponKeys, setSelectedUserKeys, setSelectedCouponKeys } =
		data;

	const { coupon_code } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState({
		open: false,
		severity: "info",
		title: "",
		text: "",
	});

	const showAlert = ({ severity, title, text }) => {
		setAlert({
			open: true,
			severity,
			title,
			text,
		});
	};

	const handleDownload = async () => {
		try {
			setLoading(true);

			for (let i = 0; i < selectedCouponKeys.length; i++) {
				const couponCode = selectedCouponKeys[i];

				console.log("선택 쿠폰", couponCode);

				const couponResult = await CouponService.selectCoupon(couponCode);

				const couponData = couponResult.data;

				for (let j = 0; j < selectedUserKeys.length; j++) {
					const userId = selectedUserKeys[j];

					console.log("선택 유저", userId);

					await CouponService.insertCoupon({
						...couponData,
						id: userId,
					});
				}
			}

			showAlert({
				severity: "success",
				title: "지급 성공",
				text: "쿠폰이 지급되었습니다.",
			});

			setSelectedUserKeys([]);
			setSelectedCouponKeys([]);
		} catch (error) {
			console.log(error);

			showAlert({
				severity: "error",
				title: "지급 실패",
				text: "쿠폰 지급 중 오류가 발생했습니다.",
			});
		}
		setLoading(false);
	};

	return (
		<>
			<Button variant="contained" disabled={loading} onClick={handleDownload}>
				{loading ? "발급 중..." : "쿠폰 지급"}
			</Button>
			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() =>
					setAlert((prev) => ({
						...prev,
						open: false,
					}))
				}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Alert
					severity={alert.severity}
					onClose={() =>
						setAlert((prev) => ({
							...prev,
							open: false,
						}))
					}>
					<AlertTitle>{alert.title}</AlertTitle>
					{alert.text}
				</Alert>
			</Snackbar>
		</>
	);
};

export default CouponDownDev;
