package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;

@Mapper
public interface ImageMapper {

	public ImageDTO getOne(ImageQueryDTO queryDTO) throws Exception;

	public List<ImageDTO> getList(ImageQueryDTO queryDTO) throws Exception;

	public void insertImage(ImageDTO dto) throws Exception;

	public ImageDTO getImgByFileName(String name) throws Exception;

	int updateImageName(List<Map<String, String>> updateList) throws Exception;

	public void deleteImage(String name) throws Exception;

}
