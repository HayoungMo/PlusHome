package com.spring.home;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.BookingDTO;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.dto.InvoiceDTO;
import com.spring.home.service.InteriorService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/interior")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class InteriorController {
	@Resource
	private InteriorService interiorService;
	
	
	@GetMapping
	public List<CompanyDTO> getLists() {

	    return interiorService.getLists();
	}
	
	@PostMapping("/read")
	public List<InteriorDTO> getReadData(@RequestBody CompanyDTO dto) throws Exception {
	    return interiorService.getReadData(dto);
	}
	
	@PostMapping("/example")
	public List<InteriorExampleDTO> getExamples(@RequestBody CompanyDTO dto) throws Exception {
	    return interiorService.getExamples(dto);
	}

	@PostMapping("/add/interior")
	public void insertInteriorData(@RequestBody InteriorDTO dto) throws Exception {
	    interiorService.insertInteriorData(dto);
	}
	
	@PostMapping("/add/example")
	public void insertInteriorExampleData(@RequestBody InteriorExampleDTO dto) throws Exception {
	    interiorService.insertInteriorExampleData(dto);	    
	}
	
	@PostMapping("/add/booking")
	public void insertBookData(@RequestBody BookingDTO dto) throws Exception {
	    interiorService.insertBookingData(dto);	    
	}
	
	@PostMapping("/add/invoice")
	public void insertInvoiceData(@RequestBody InvoiceDTO dto) throws Exception {
	    interiorService.insertInvoiceData(dto);	    
	}
	
	
}
