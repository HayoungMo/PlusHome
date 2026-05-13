package com.spring.home;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.QuestionDTO;
import com.spring.home.service.QuestionService;

@RestController
@RequestMapping("/question")
public class QuestionController {
	
	@Autowired
	private QuestionService questionService;
	
	//상품별 문의 목록
	@GetMapping("/list")
	public List<QuestionDTO> getListsByFCode(@RequestParam String f_code) throws Exception {
		return questionService.getListsByFCode(f_code);
	}
	
	//문의 상세 페이지(?)
	@GetMapping("/read")
	public QuestionDTO getReadDataByQIdx(@RequestParam int q_idx) throws Exception{
		return questionService.getReadDataByQIdx(q_idx);
	}
	
	//문의 작성 페이지
	@PostMapping("/write")
	public QuestionDTO insertData(@RequestBody QuestionDTO dto) throws Exception{
		questionService.insertData(dto);
		return dto;
	}
	
	//업체측 문의 답변 작성
	@PostMapping("/answer")
	public String updateAnswer(@RequestBody QuestionDTO dto) throws Exception{
		questionService.updateAnswer(dto);
		return "ok";
	}
	
	//마이페이지에서 자신이 작성한 문의 글
	@GetMapping("/my")
	public List<QuestionDTO> getMyQuestions(@RequestParam String id) throws Exception {
		return questionService.getMyQuestions(id);
	}
	
	//문의 글 삭제
	@PostMapping("/update")
	public String updateData(@RequestBody QuestionDTO dto) throws Exception{
		questionService.updateData(dto);
		return "ok";
	}
	
	//문의 삭제
	@PostMapping("/delete")
	public String deleteData(@RequestParam int q_idx) throws Exception{
		questionService.deleteData(q_idx);
		return "ok";
	}
	
}
