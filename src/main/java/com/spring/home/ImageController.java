package com.spring.home;

import java.util.List;

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
		System.out.println("@@ Image == // == getOne");
		System.out.println(queryDTO);
		return ImageService.getOne(queryDTO);
	}

	@PostMapping("/getList")
	public List<ImageDTO> getList(@RequestBody ImageQueryDTO queryDTO) {
		return ImageService.getList(queryDTO);
	}

	@PostMapping("/insertImage")
	public FileSaveResult insertImage(@RequestPart("files") List<MultipartFile> files,
			@RequestPart("dtoList") List<ImageDTO> dtoList) {
		FileSaveResult fileSaveResult = FileUtilMethod.fileSaveToServer(files,dtoList);
		fileSaveResult.getSavedList().forEach(e -> ImageService.insertImage(e));
		return fileSaveResult;
		
	}
	
//	@PostMapping("/DeleteImage")
//	public 

}
