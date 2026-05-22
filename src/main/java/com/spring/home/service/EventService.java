package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.EventDTO;
import com.spring.home.mapper.EventMapper;

@Service
public class EventService {
	
	@Autowired
	private EventMapper eventmapper;
	

	public void insertData(EventDTO dto) throws Exception{		
		eventmapper.insertData(dto);
	}
	

	public List<EventDTO> getlistData() throws Exception{		
		return eventmapper.getlistData();
	}
	
	public EventDTO getReadData(EventDTO dto) throws Exception{
		return eventmapper.getReadData(dto);
	}
	
	public List<EventDTO> getPopupData() throws Exception{
		return eventmapper.getPopupData();
	}
	
	public void updateData(EventDTO dto) throws Exception{
		eventmapper.updateData(dto);
	}

	public void deleteData(EventDTO dto) throws Exception{
		eventmapper.deleteData(dto);
	}

}
