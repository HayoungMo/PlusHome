package com.spring.home.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.mapper.ImageMapper;

@Service
public class ImageService {

	@Autowired
	private ImageMapper imageMapper;

	public ImageDTO getOne(ImageQueryDTO queryDTO) {

		ImageDTO dto = null;

		try {
			dto = imageMapper.getOne(queryDTO);
		} catch (Exception e) {
			System.out.println(e.toString());
		}

		return dto;
	}

	public List<ImageDTO> getList(ImageQueryDTO queryDTO) {

		List<ImageDTO> lists = null;

		try {
			lists = imageMapper.getList(queryDTO);
		} catch (Exception e) {
			System.out.println(e.toString());
		}

		return lists;
	}

	public void insertImage(ImageDTO dto) {
		System.out.println("service insertImage");
		try {
			imageMapper.insertImage(dto);
		} catch (Exception e) {
			System.out.println(e.toString());
		}
	}

	public ImageDTO getImgByFileName(String name) {
		ImageDTO dto = null;
		try {
			dto = imageMapper.getImgByFileName(name);
		} catch (Exception e) {
			System.out.println(e.toString());
		}
		return dto;
	}

	public int updateImageName(List<Map<String, String>> updateList) {
		int result = 0;
		try {
			result = imageMapper.updateImageName(updateList);
		} catch (Exception e) {
			System.out.println(e.toString());
		}
		return result;
	}

	public void deleteImage(String name) {
		try {
			imageMapper.deleteImage(name);
		} catch (Exception e) {
			System.out.println(e.toString());
		}
	}

}
