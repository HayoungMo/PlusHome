package com.spring.home.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.ImageDTO;
import com.spring.home.mapper.ImageMapper;

@Service
public class ImageService {

	@Autowired
	private ImageMapper imageMapper;

	public ImageDTO getThumbnail() {

		ImageDTO dto = null;

		try {
			dto = imageMapper.getThumbnail();
		} catch (Exception e) {
			System.out.println(e.toString());
		}

		return dto;
	}

}
