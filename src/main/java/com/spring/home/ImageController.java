package com.spring.home;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spring.home.dto.FileSaveResult;
import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.service.ImageService;
import com.spring.home.util.FileUtilMethod;

@RequestMapping("/image")
@RestController
public class ImageController {

	@Autowired
	private ImageService ImageService;

	@PostMapping("/getOne")
	public ImageDTO getOne(@RequestBody ImageQueryDTO queryDTO) {
		return ImageService.getOne(queryDTO);
	}

	@PostMapping("/getList")
	public List<ImageDTO> getList(@RequestBody ImageQueryDTO queryDTO) {
		System.out.println(queryDTO);
		return ImageService.getList(queryDTO);
	}

	@PostMapping("/insertImage")
	public FileSaveResult insertImage(@RequestPart("files") List<MultipartFile> files,
			@RequestPart("dtoList") List<ImageDTO> dtoList) {
		FileSaveResult fileSaveResult = FileUtilMethod.fileSaveFromServer(files, dtoList);
		if (fileSaveResult.isSuccess()) {
			fileSaveResult.getSavedList().forEach(e -> ImageService.insertImage(e));
		}
		return fileSaveResult;

	}

	@PostMapping("/updateImage")
	public FileSaveResult updateImage(@RequestPart("files") List<MultipartFile> files,
			@RequestPart(value = "updateInfoList", required = false) List<ImageQueryDTO> updateInfoList) {
		List<ImageDTO> dtoList = new ArrayList<ImageDTO>();
		List<String> beforeNameList = new ArrayList<>();
		files.forEach(e -> {
			ImageDTO dto = ImageService.getImgByFileName(removeExtension(e.getOriginalFilename()));
			dtoList.add(dto);
			beforeNameList.add(dto.getImg_name());
		});
		FileSaveResult fileSaveResult = FileUtilMethod.fileUpdateFromServer(files, dtoList);
		if (fileSaveResult.isSuccess()) {
			List<Map<String, String>> updateList = new ArrayList<>();
			for (int i = 0; i < dtoList.size(); i++) {
				ImageDTO afterDto = fileSaveResult.getSavedList().get(i);

				Map<String, String> map = new HashMap<>();
				map.put("before", beforeNameList.get(i));
				map.put("after", afterDto.getImg_name());

				updateList.add(map);
			}
			System.out.println("\n Start updateImageName ================");

			int result = ImageService.updateImageNameOne(updateList);

			System.out.println("result : " + result);
			if (result == 0) {
				fileSaveResult.setError("저장 후 이름 변경 실패 - 전체");
				fileSaveResult.setFailCount(updateList.size());
				fileSaveResult.setSuccess(false);
				fileSaveResult.setSuccessCount(0);
			} else if (result != updateList.size()) {
				fileSaveResult.setError("저장 후 이름 변경 실패 - 일부");
				fileSaveResult.setFailCount(updateList.size() - result);
				fileSaveResult.setSuccess(false);
				fileSaveResult.setSuccessCount(result);
			} else {
				System.out.println("\n Start updateInfoList ================");
				if (updateInfoList != null && !updateInfoList.isEmpty()) {
					for (int i = 0; i < updateInfoList.size(); i++) {
						ImageDTO afterDto = fileSaveResult.getSavedList().get(i);
						updateInfoList.get(i).setName(afterDto.getImg_name());
					}
					int infoResult = ImageService.updateImageInfo(updateInfoList);
					System.out.println("result : " + result);
					if (infoResult == 0) {
						fileSaveResult.setFailCount(updateInfoList.size());
						fileSaveResult.setSuccess(false);
						fileSaveResult.setError("이미지 정보 업데이트 실패");
					} else if (infoResult != updateList.size()) {
						fileSaveResult.setFailCount(updateInfoList.size() - infoResult);
						fileSaveResult.setSuccess(false);
						fileSaveResult.setError("일부 이미지 정보 업데이트 실패");
					} else {
						fileSaveResult.setSuccessCount(infoResult);
						fileSaveResult.setSuccess(true);
					}
				} else {
					fileSaveResult.setSuccessCount(result);
					fileSaveResult.setSuccess(true);
				}
			}
		}
		System.out.println("================================");
		return fileSaveResult;
	}

	private String removeExtension(String fileName) {
		if (fileName == null)
			return null;

		int dotIndex = fileName.lastIndexOf(".");
		if (dotIndex == -1) {
			return fileName; // 확장자 없음
		}
		return fileName.substring(0, dotIndex);
	}

	@PostMapping("/deleteImage")
	public FileSaveResult deleteImage(@RequestBody List<String> fileNames) {
		List<ImageDTO> dtoList = new ArrayList<ImageDTO>();
		fileNames.forEach(e -> dtoList.add(ImageService.getImgByFileName(removeExtension(e))));
		FileSaveResult fileSaveResult = FileUtilMethod.fileDeleteFromServer(dtoList);
		if (fileSaveResult.isSuccess()) {
			fileSaveResult.getSavedList().forEach(e -> ImageService.deleteImage(e.getImg_name()));
		}
		return fileSaveResult;
	}

	@PostMapping("/updateImageInfo")
	public FileSaveResult updateImageInfo(@RequestBody List<ImageQueryDTO> dtoList) {
		FileSaveResult fileSaveResult = new FileSaveResult();
		try {
			int result = ImageService.updateImageInfo(dtoList);
			fileSaveResult.setSuccessCount(result);
			fileSaveResult.setSuccess(true);
		} catch (Exception e) {
			fileSaveResult.setError("파일 정보 변경 실패");
			fileSaveResult.setSuccess(false);
		}
		return fileSaveResult;
	}

}
