package com.spring.home;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.PaymentDTO;
import com.spring.home.dto.WalletDTO;
import com.spring.home.service.PaymentService;
import com.spring.home.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
public class PaymentController {

	private final PaymentService paymentService;
	private final JwtUtil jwtUtil;
	
	@PostMapping
	public ResponseEntity<?> pay(
			@RequestBody PaymentDTO dto,
			HttpServletRequest request) throws Exception{
		
		String token = request.getHeader("Authorization").replace("Bearer ", "");
		String id = jwtUtil.getId(token);
		
		paymentService.pay(id,dto);
		
		Map<String, String> result = new HashMap<>();
		result.put("message", "결제 완료");
		
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/orders")
	public ResponseEntity<?> getMyOrders(HttpServletRequest request) throws Exception{
		String token = request.getHeader("Authorization").replace("Bearer ", "");
		String id = jwtUtil.getId(token);
		
		return ResponseEntity.ok(paymentService.getMyOrders(id));
	}
	
	@PostMapping("/cancel")
	public ResponseEntity<?> cancelOrder(
	        @RequestBody Map<String, String> body,
	        HttpServletRequest request) throws Exception {

	    String token = request.getHeader("Authorization").replace("Bearer ", "");
	    String id = jwtUtil.getId(token);

	    paymentService.cancelOrder(id, body.get("c_code"));

	    Map<String, String> result = new HashMap<>();
	    result.put("message", "주문취소 완료");

	    return ResponseEntity.ok(result);
	}

	@PostMapping("/confirm")
	public ResponseEntity<?> confirmOrder(
	        @RequestBody Map<String, String> body,
	        HttpServletRequest request) throws Exception {

	    String token = request.getHeader("Authorization").replace("Bearer ", "");
	    String id = jwtUtil.getId(token);

	    paymentService.confirmOrder(id, body.get("c_code"));

	    Map<String, String> result = new HashMap<>();
	    result.put("message", "구매확정 완료");

	    return ResponseEntity.ok(result);
	}

}
