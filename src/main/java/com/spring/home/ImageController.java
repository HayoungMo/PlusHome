package com.spring.home;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.service.ImageService;

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
		System.out.println("@@ Image == // == getList");
		System.out.println(queryDTO);
		return ImageService.getList(queryDTO);
	}
	
	@PostMapping("/insertImage")
	public void insertImage(@RequestBody ImageQueryDTO queryDTO) {
		System.out.println("@@ Image == // == insertImage");
		System.out.println(queryDTO);
	}

	private boolean validateImageCondition(ImageQueryDTO queryDTO) {
		boolean result = false;

		return result;
	}

}
