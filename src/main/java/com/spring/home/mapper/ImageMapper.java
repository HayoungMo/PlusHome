package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;

@Mapper
public interface ImageMapper {

	public ImageDTO getOne(ImageQueryDTO queryDTO) throws Exception;

	public List<ImageDTO> getList(ImageQueryDTO queryDTO) throws Exception;

	public void insertImage(ImageDTO dto) throws Exception;

}
