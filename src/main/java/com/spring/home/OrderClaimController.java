package com.spring.home;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.OrderClaimDTO;
import com.spring.home.service.OrderClaimService;
import com.spring.home.util.JwtUtil;

@RestController
@RequestMapping("/claim")
public class OrderClaimController {

	@Autowired
	private OrderClaimService orderClaimService;
	
	@Autowired JwtUtil jwtUtil;
	
	private String getIdFromRequest(HttpServletRequest request) {
		String token = request.getHeader("Authorization").replace("Bearer ", "");
		return jwtUtil.getId(token);
	}
	
	@PostMapping("/create")
	public ResponseEntity<?> createClaim(
			@RequestBody OrderClaimDTO dto,
			HttpServletRequest request) throws Exception{
		
		String id = getIdFromRequest(request);
		
		String claimCode = orderClaimService.createClaim(id, dto);
		
		Map<String, Object> result = new HashMap<>();
		result.put("message", "교환/반품 신청이 접수되었습니다.");
		result.put("claim_code", claimCode);
		
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/check")
	public ResponseEntity<?> checkClaim(
			@RequestParam String c_code,
			HttpServletRequest request) throws Exception{
		
		String id = getIdFromRequest(request);
		
		OrderClaimDTO claim = orderClaimService.checkClaim(id, c_code);
		
		Map<String, Object> result = new HashMap<>();
		result.put("claimed", claim != null);
		
		if (claim != null) {
			result.put("claim_code", claim.getClaim_code());
			result.put("claim_type", claim.getClaim_type());
            result.put("claim_status", claim.getClaim_status());
    		result.put("claim_reason", claim.getClaim_reason());
		}
	
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/my")
    public ResponseEntity<?> getMyClaims(HttpServletRequest request) throws Exception {
        String id = getIdFromRequest(request);

        return ResponseEntity.ok(orderClaimService.getMyClaims(id));
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAllClaims() throws Exception {
        return ResponseEntity.ok(orderClaimService.getAllClaims());
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody OrderClaimDTO dto) throws Exception {
        orderClaimService.updateStatus(dto.getClaim_code(), dto.getClaim_status());

        Map<String, String> result = new HashMap<>();
        result.put("message", "교환/반품 상태가 변경되었습니다.");

        return ResponseEntity.ok(result);
    }
	    
}
