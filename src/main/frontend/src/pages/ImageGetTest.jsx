import React, { useState } from "react";
import ImageService from "../service/imageService";

const ImageGetTest = () => {
	const [userProfile, setUserProfile] = useState(null);

	const getThumbnail = () => {
		ImageService.getThumbnail().then((res) => {
			console.log(res);
		});
	};

	return (
		<div>
			<h2>IMAGE</h2>
			<div>
				<input type="button" value="GET IMG" onClick={getThumbnail} />
				<img src="http://localhost:8080/api/images/test1.jpg" alt="테스트" />
       
				{/* <img src={userProfile} alt="" /> */}
			</div>
		</div>
	);
};

export default ImageGetTest;
