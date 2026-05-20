package com.spring.home;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.EventDTO;
import com.spring.home.service.CouponService;
import com.spring.home.service.EventService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/event")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {
	
	@Autowired
	private EventService eventService;	

	
	@PostMapping("/insert")
	public void insertData(@RequestBody EventDTO dto) throws Exception{	
		eventService.insertData(dto);
	}
	
	@GetMapping("/getlist")
	public List<EventDTO> getlistData() throws Exception{		
		return eventService.getlistData();
	}
	
	@PostMapping("/getdata")
	public EventDTO getReadData(@RequestBody EventDTO dto) throws Exception{
		return eventService.getReadData(dto);
	}
	
	@PostMapping("/update")
	public void updateData(@RequestBody EventDTO dto) throws Exception{
		eventService.updateData(dto);
	}
	@PostMapping("/delete")
	public void deleteData(@RequestBody EventDTO dto) throws Exception{
		eventService.deleteData(dto);
	}


}
