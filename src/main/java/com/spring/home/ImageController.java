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
	public FileSaveResult updateImage(@RequestPart("files") List<MultipartFile> files) {
		List<ImageDTO> dtoList = new ArrayList<ImageDTO>();
		files.forEach(e -> dtoList.add(ImageService.getImgByFileName(removeExtension(e.getOriginalFilename()))));
		FileSaveResult fileSaveResult = FileUtilMethod.fileUpdateFromServer(files, dtoList);
		if (fileSaveResult.isSuccess()) {
			List<Map<String, String>> updateList = new ArrayList<>();
			for (int i = 0; i < dtoList.size(); i++) {
				ImageDTO beforeDto = dtoList.get(i);
				ImageDTO afterDto = fileSaveResult.getSavedList().get(i);

				Map<String, String> map = new HashMap<>();
				map.put("before", beforeDto.getImg_name());
				map.put("after", afterDto.getImg_name());

				updateList.add(map);
			}
			int result = ImageService.updateImageName(updateList);
		}

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

}
