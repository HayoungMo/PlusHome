package com.spring.home;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
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
	
}
