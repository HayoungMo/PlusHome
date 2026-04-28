package com.spring.home.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.ImageDTO;

@Mapper
public interface ImageMapper {

	public ImageDTO getThumbnail() throws Exception;

}
