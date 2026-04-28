package com.spring.home;

import java.io.File;
import java.net.MalformedURLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.ImageDTO;
import com.spring.home.service.ImageService;

@RequestMapping("/image")
@RestController
public class ImageController {

	@Autowired
	private ImageService ImageService;

	@RequestMapping("/getImage")
	public ImageDTO getThumbnail() {
		return ImageService.getThumbnail();
	}

}
