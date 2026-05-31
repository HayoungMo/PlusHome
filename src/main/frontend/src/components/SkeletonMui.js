import React from "react";
import { Skeleton } from "@mui/material";

/**
 * 대시보드 KPI 전용 스켈레톤
 * 기존 InteriorDashboard CSS 구조를 그대로 사용한다.
 * 이 구조를 바꾸면 대시보드 디자인이 깨질 수 있으므로 유지한다.
 */
const KpiSkeleton = ({ count = 6, classNamePrefix = "interior-dashboard" }) => (
	<>
		{Array.from({ length: count }, (_, index) => (
			<div
				className={`${classNamePrefix}-kpi ${classNamePrefix}-kpi-skeleton`}
				key={`kpi-skeleton-${index}`}>
				<Skeleton
					className={`${classNamePrefix}-kpi-skeleton-icon`}
					variant="circular"
					animation="wave"
				/>

				<div className={`${classNamePrefix}-kpi-body`}>
					<Skeleton variant="text" width="44%" height={22} animation="wave" />
					<Skeleton variant="text" width="72%" height={48} animation="wave" />
					<Skeleton variant="text" width="58%" height={20} animation="wave" />
				</div>
			</div>
		))}
	</>
);

/**
 * 가구 카드 목록 전용 스켈레톤
 * FurnitureList의 카드 구조와 비슷하게 맞춘다.
 * 기존 FurnitureList가 inline style 중심이라, 여기서도 inline style로 형태를 맞춘다.
 */
const FurnitureCardSkeleton = ({ count = 8 }) => (
	<>
		{Array.from({ length: count }, (_, index) => (
			<div
				key={`furniture-card-skeleton-${index}`}
				style={{
					cursor: "default",
					minWidth: 0,
					textAlign: "left",
				}}>
				<div
					style={{
						position: "relative",
						width: "100%",
						aspectRatio: "1 / 1.18",
						borderRadius: "8px",
						overflow: "hidden",
						background: "#f7f7f7",
						marginBottom: "10px",
					}}>
					<Skeleton
						variant="rounded"
						animation="wave"
						width="100%"
						height="100%"
						sx={{
							position: "absolute",
							inset: 0,
							borderRadius: "8px",
						}}
					/>

					<Skeleton
						variant="circular"
						animation="wave"
						width={26}
						height={26}
						sx={{
							position: "absolute",
							right: "10px",
							bottom: "8px",
						}}
					/>
				</div>

				<Skeleton
					variant="rounded"
					animation="wave"
					width={82}
					height={23}
					sx={{ marginBottom: "7px" }}
				/>

				<Skeleton
					variant="text"
					animation="wave"
					width="62%"
					height={25}
					sx={{ marginBottom: "6px" }}
				/>

				<Skeleton
					variant="text"
					animation="wave"
					width={70}
					height={14}
					sx={{ marginBottom: "2px" }}
				/>

				<div
					style={{
						display: "flex",
						alignItems: "baseline",
						gap: "4px",
						marginBottom: "5px",
					}}>
					<Skeleton variant="text" animation="wave" width={28} height={24} />
					<Skeleton variant="text" animation="wave" width={118} height={30} />
				</div>

				<Skeleton variant="text" animation="wave" width={84} height={20} />
			</div>
		))}
	</>
);

const ShoppingMallProductCardSkeleton = ({ count = 5 }) => (
	<>
		{Array.from({ length: count }, (_, index) => (
			<div
				className="shopping-mall-product-card shopping-mall-product-card-skeleton"
				key={`shopping-mall-product-card-skeleton-${index}`}>
				<div className="shopping-mall-product-thumb">
					<Skeleton
						variant="rounded"
						animation="wave"
						width="100%"
						height="100%"
						sx={{ borderRadius: "inherit" }}
					/>
				</div>

				<div className="shopping-mall-product-main">
					<Skeleton variant="text" animation="wave" width="70%" height={28} />
					<Skeleton variant="text" animation="wave" width="55%" height={30} />
					<Skeleton variant="text" animation="wave" width="45%" height={22} />
				</div>

				<div className="shopping-mall-product-metrics">
					<Skeleton variant="text" animation="wave" width="80%" height={22} />
					<Skeleton variant="text" animation="wave" width="75%" height={22} />
					<Skeleton variant="text" animation="wave" width="70%" height={22} />
				</div>

				<div className="shopping-mall-product-metrics">
					<Skeleton variant="text" animation="wave" width="85%" height={22} />
					<Skeleton variant="text" animation="wave" width="90%" height={22} />
					<Skeleton variant="text" animation="wave" width="80%" height={22} />
					<Skeleton variant="text" animation="wave" width="75%" height={22} />
				</div>

				<div className="shopping-mall-product-actions">
					<Skeleton variant="rounded" animation="wave" width={64} height={36} />
					<Skeleton variant="rounded" animation="wave" width={64} height={36} />
				</div>
			</div>
		))}
	</>
);
/**
 * SkeletonMui
 *
 * 여러 화면에서 공통으로 사용할 스켈레톤 컴포넌트.
 * 단, 기존 화면 디자인을 깨지 않기 위해 variant별 구조를 분리한다.
 */
const SkeletonMui = ({ variant = "kpi", ...props }) => {
	if (variant === "kpi") {
		return <KpiSkeleton {...props} />;
	}

	if (variant === "furnitureCard") {
		return <FurnitureCardSkeleton {...props} />;
	}

	if (variant === "shoppingMallProductCard") {
		return <ShoppingMallProductCardSkeleton {...props} />;
	}
	return <Skeleton animation="wave" {...props} />;
};

export default SkeletonMui;
