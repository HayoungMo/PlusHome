package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.EventDTO;

@Mapper
public interface EventMapper {
	public void insertData(EventDTO dto) throws Exception;	

	public List<EventDTO> getlistData() throws Exception;
	
	public List<EventDTO> getReadData(EventDTO dto) throws Exception;
	
	public void updateData(EventDTO dto) throws Exception;

	public void deleteData(EventDTO dto) throws Exception;

}
