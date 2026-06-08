import React from "react";

const DashboardHome = ({ userData = {} }) => {
	const { name, companyList = [] } = userData;

	return (
		<div className="dashboard-home">
			<div className="dashboard-home-header">
				<div>
					<h3>{name || "사용자"}님의 사업체 정보</h3>
					<p>등록된 사업체를 한눈에 확인합니다.</p>
				</div>
				<span>{companyList.length}개</span>
			</div>

			<div className="dashboard-home-company-grid">
				{companyList.length > 0 ? (
					companyList.map((record, index) => (
						<div
							className="dashboard-home-company-card"
							key={`${record.c_id || record.c_name || "company"}-${index}`}>
							<span>{index + 1}</span>
							<strong>{record.c_name || "이름 없음"}</strong>
							<p>{record.c_kind || "-"}</p>
							<p>{record.c_addr || "주소 정보가 없습니다."}</p>
						</div>
					))
				) : (
					<div className="dashboard-home-empty">등록된 사업체가 없습니다.</div>
				)}
			</div>
		</div>
	);
};

export default DashboardHome;
