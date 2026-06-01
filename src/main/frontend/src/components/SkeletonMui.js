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

const InteriorMediaCardSkeleton = ({
	count = 6,
	groupTitle = true,
	groupClassName = "interior-example-group",
	gridClassName = "interior-example-grid",
	cardClassName = "interior-example-card",
	thumbClassName = "interior-example-thumb",
	infoClassName = "interior-example-info",
}) => (
	<div className={groupClassName}>
		{groupTitle && (
			<Skeleton
				variant="rounded"
				animation="wave"
				width={160}
				height={34}
				sx={{ borderRadius: "8px", marginBottom: "14px" }}
			/>
		)}

		<div className={gridClassName}>
			{Array.from({ length: count }, (_, index) => (
				<div
					className={`${cardClassName} interior-media-card-skeleton`}
					key={`interior-media-card-skeleton-${index}`}>
					<div className={thumbClassName}>
						<Skeleton
							variant="rounded"
							animation="wave"
							width="100%"
							height="100%"
							sx={{ borderRadius: "inherit" }}
						/>
					</div>

					<div className={infoClassName}>
						<StackSkeleton />
						<Skeleton variant="text" animation="wave" width="90%" height={22} />
						<Skeleton variant="text" animation="wave" width="68%" height={22} />
					</div>
				</div>
			))}
		</div>
	</div>
);

const StackSkeleton = () => (
	<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
		<Skeleton variant="rounded" animation="wave" width={62} height={24} />
		<Skeleton variant="rounded" animation="wave" width={78} height={24} />
	</div>
);

const EventCardSkeleton = ({ count = 6 }) => (
	<div className="event-card-grid">
		{Array.from({ length: count }, (_, index) => (
			<div className="event-card event-card-skeleton" key={`event-card-skeleton-${index}`}>
				<Skeleton
					variant="rounded"
					animation="wave"
					width="100%"
					height="100%"
					sx={{ borderRadius: "inherit" }}
				/>
			</div>
		))}
	</div>
);

const EventArticleSkeleton = () => (
	<div className="event-article-skeleton">
		<Skeleton variant="text" animation="wave" width="48%" height={48} />
		<Skeleton
			variant="rounded"
			animation="wave"
			width="100%"
			height={420}
			sx={{ borderRadius: "8px" }}
		/>
		<div className="event-article-skeleton-lines">
			<Skeleton variant="text" animation="wave" width="96%" height={24} />
			<Skeleton variant="text" animation="wave" width="88%" height={24} />
			<Skeleton variant="text" animation="wave" width="72%" height={24} />
		</div>
		<div className="coupon-article-download event-article-coupon-skeleton">
			<div className="coupon-article-download-header">
				<div>
					<Skeleton variant="text" animation="wave" width={72} height={18} />
					<Skeleton variant="text" animation="wave" width={160} height={32} />
				</div>
				<Skeleton variant="rounded" animation="wave" width={44} height={30} />
			</div>
			<div className="coupon-article-download-list">
				<Skeleton variant="rounded" animation="wave" width="100%" height={96} />
				<Skeleton variant="rounded" animation="wave" width="100%" height={96} />
			</div>
		</div>
	</div>
);

const MainEventBannerSkeleton = () => (
	<div className="main-event-banner-skeleton">
		<Skeleton
			variant="rounded"
			animation="wave"
			width="100%"
			height="100%"
			sx={{ borderRadius: "8px" }}
		/>
	</div>
);

const EventPopupSkeleton = () => (
	<div className="event-popup-skeleton">
		<Skeleton
			variant="rounded"
			animation="wave"
			width="100%"
			height={420}
			sx={{ borderRadius: 0 }}
		/>
		<div className="event-popup-skeleton-actions">
			<Skeleton variant="rounded" animation="wave" width={72} height={36} />
			<Skeleton variant="rounded" animation="wave" width={150} height={36} />
		</div>
	</div>
);

const InteriorArticleAISkeleton = () => (
	<div className="interior-article-ai-skeleton">
		<Skeleton variant="text" animation="wave" width="94%" height={28} />
		<Skeleton variant="text" animation="wave" width="88%" height={28} />
		<Skeleton variant="text" animation="wave" width="72%" height={28} />
	</div>
);

const InteriorRecommendAISkeleton = () => (
	<div className="interior-recommend-ai-skeleton">
		<Skeleton variant="text" animation="wave" width="92%" height={20} />
		<Skeleton variant="text" animation="wave" width="76%" height={20} />
		<Skeleton variant="text" animation="wave" width="84%" height={20} />
	</div>
);

const InteriorCompanyCardSkeleton = ({
	count = 6,
	cardClassName = "interior-company-list-card",
	showRank = false,
	showAi = false,
}) => (
	<>
		{Array.from({ length: count }, (_, index) => (
			<div
				className={`interior-company-card ${cardClassName} interior-company-card-skeleton`}
				key={`interior-company-card-skeleton-${index}`}>
				<div className="interior-company-image interior-company-image-skeleton">
					<Skeleton
						variant="rounded"
						animation="wave"
						width="100%"
						height="100%"
						sx={{ borderRadius: "inherit" }}
					/>
				</div>

				{showRank && (
					<Skeleton
						className="interior-recommend-score"
						variant="rounded"
						animation="wave"
						width={58}
						height={22}
					/>
				)}

				<div className="interior-company-info">
					<Skeleton variant="text" animation="wave" width="58%" height={28} />
					<Skeleton variant="text" animation="wave" width="38%" height={18} />
					<Skeleton variant="text" animation="wave" width="46%" height={18} />
					<Skeleton variant="text" animation="wave" width="64%" height={18} />
					<Skeleton variant="text" animation="wave" width="86%" height={18} />

					{showAi && (
						<div className="interior-recommend-ai">
							<Skeleton variant="text" animation="wave" width={120} height={22} />
							<InteriorRecommendAISkeleton />
						</div>
					)}
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

	if (variant === "interiorMediaCard") {
		return <InteriorMediaCardSkeleton {...props} />;
	}

	if (variant === "eventCard") {
		return <EventCardSkeleton {...props} />;
	}

	if (variant === "eventArticle") {
		return <EventArticleSkeleton {...props} />;
	}

	if (variant === "mainEventBanner") {
		return <MainEventBannerSkeleton {...props} />;
	}

	if (variant === "eventPopup") {
		return <EventPopupSkeleton {...props} />;
	}

	if (variant === "interiorArticleAI") {
		return <InteriorArticleAISkeleton {...props} />;
	}

	if (variant === "interiorRecommendAI") {
		return <InteriorRecommendAISkeleton {...props} />;
	}

	if (variant === "interiorCompanyCard") {
		return <InteriorCompanyCardSkeleton {...props} />;
	}
	return <Skeleton animation="wave" {...props} />;
};

export default SkeletonMui;
