import React from "react";
import { Skeleton } from "@mui/material";

const KpiSkeleton = ({ count = 6, classNamePrefix = "interior-dashboard" }) => (
	<>
		{Array.from({ length: count }, (_, index) => (
			<div className={`${classNamePrefix}-kpi ${classNamePrefix}-kpi-skeleton`} key={`kpi-skeleton-${index}`}>
				<Skeleton className={`${classNamePrefix}-kpi-skeleton-icon`} variant="circular" animation="wave" />
				<div className={`${classNamePrefix}-kpi-body`}>
					<Skeleton variant="text" width="44%" height={22} animation="wave" />
					<Skeleton variant="text" width="72%" height={48} animation="wave" />
					<Skeleton variant="text" width="58%" height={20} animation="wave" />
				</div>
			</div>
		))}
	</>
);

const SkeletonMui = ({ variant = "kpi", ...props }) => {
	if (variant === "kpi") {
		return <KpiSkeleton {...props} />;
	}

	return <Skeleton animation="wave" {...props} />;
};

export default SkeletonMui;
