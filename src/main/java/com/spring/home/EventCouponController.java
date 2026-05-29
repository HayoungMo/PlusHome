package com.spring.home;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.EventCouponDTO;
import com.spring.home.service.EventCouponService;

@RequestMapping("/eventCoupon")
@RestController
@CrossOrigin(origins = {
		"http://localhost:3000",
		"http://192.168.0.3:3000"
})
public class EventCouponController {
	
	@Autowired
	private EventCouponService eventCouponService;
	
	@PostMapping("/insert")
	public void insertData(@RequestBody EventCouponDTO dto) throws Exception {
		eventCouponService.insertData(dto);
	}
	
	@PostMapping("/delete")
	public void deleteData(@RequestBody EventCouponDTO dto) throws Exception {
		eventCouponService.deleteData(dto);
	}
	
	@PostMapping("/deleteByEvent")
	public void deleteByEvent(@RequestBody EventCouponDTO dto) throws Exception {
		eventCouponService.deleteByEvent(dto.getE_id());
	}
	
	@GetMapping("/event/{e_id}")
	public List<CouponDTO> getCouponsByEvent(@PathVariable int e_id) throws Exception {
		return eventCouponService.getCouponsByEvent(e_id);
	}

	@GetMapping("/usage")
	public List<Map<String, Object>> getCouponEventUsage() throws Exception {
		return eventCouponService.getCouponEventUsage();
	}
}
