package com.spring.home;

import java.util.HashMap;
import java.util.List;
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
import com.spring.home.dto.OrderClaimUpdateDTO;
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

	@GetMapping("/company")
	public ResponseEntity<?> getCompanyClaims(HttpServletRequest request) throws Exception{
		String companyId = getIdFromRequest(request);
		
		return ResponseEntity.ok(orderClaimService.getCompanyClaims(companyId));
	}
	
    @GetMapping("/admin")
    public ResponseEntity<?> getAllClaims() throws Exception {
        return ResponseEntity.ok(orderClaimService.getAllClaims());
    }

    @PutMapping("/type")
    public ResponseEntity<?> updateType(@RequestBody OrderClaimDTO dto) throws Exception {
        orderClaimService.updateType(dto.getClaim_code(), dto.getClaim_type());

        Map<String, String> result = new HashMap<>();
        result.put("message", "교환/반품 유형이 변경되었습니다.");

        return ResponseEntity.ok(result);
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody OrderClaimDTO dto) throws Exception {
        orderClaimService.updateStatus(dto.getClaim_code(), dto.getClaim_status());

        Map<String, String> result = new HashMap<>();
        result.put("message", "교환/반품 상태가 변경되었습니다.");

        return ResponseEntity.ok(result);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateClaim(@RequestBody OrderClaimUpdateDTO dto) throws Exception {
        orderClaimService.updateClaim(dto);

        Map<String, String> result = new HashMap<>();
        result.put("message", "교환/반품 정보가 변경되었습니다.");

        return ResponseEntity.ok(result);
    }

    @PutMapping("/bulk")
    public ResponseEntity<?> updateBulk(@RequestBody List<OrderClaimUpdateDTO> list) throws Exception {
        orderClaimService.updateBulk(list);

        Map<String, String> result = new HashMap<>();
        result.put("message", "선택한 교환/반품 정보가 변경되었습니다.");

        return ResponseEntity.ok(result);
    }
    
    @SuppressWarnings("unchecked")
	@PostMapping("/getListByCompany")
    public Map<String, Object> getListByCompany(@RequestBody Map<String, Object> params) throws Exception {
    	Map<String, Object> result = new HashMap<>();
    	try {
    		if (params == null) {
    			params = new HashMap<>();
    		}

    		params.put("c_kind", "shop");

    		Map<String, Object> claimResult = orderClaimService.getListByCompany(params);
    		List<Map<String, Object>> claimList = (List<Map<String, Object>>) claimResult.get("claimList");

    		result.put("success", true);
    		result.put("claimList", claimList);
    		result.put("statusCounts", claimResult.get("statusCounts"));
    		result.put("totalCount", claimResult.get("totalCount"));
    		result.put("page", claimResult.get("page"));
    		result.put("size", claimList.size());
    		if(claimList.size() > 0) {
    			result.put("message", "교환 환불 목록 조회에 성공하였습니다.");    			
    		} else {
    			result.put("message", "신청된 교환 또는 환불이 없습니다.");   
    		}
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", "교환 환불 목록 조회중 오류가 발생하였습니다.");
			result.put("error", e.toString());
		}
    	return result;
    }
    
	    
}
