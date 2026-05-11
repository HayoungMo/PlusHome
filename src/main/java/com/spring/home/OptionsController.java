package com.spring.home;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.OptionsDTO;
import com.spring.home.service.OptionsService;

@RestController
@RequestMapping("/options")
public class OptionsController {

	@Autowired
	private OptionsService optionsService;
	
	@GetMapping("/furniture/{f_code}")
	public List<OptionsDTO> getFurnitureOptions(@PathVariable String f_code) throws Exception{
		return optionsService.getListByFcode(f_code);
	}
}
