package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.QuestionDTO;
import com.spring.home.mapper.QuestionMapper;

@Service
public class QuestionService {

	@Autowired
	private QuestionMapper questionMapper;
	
	public void insertData(QuestionDTO dto) throws Exception{
		
		if (dto.getQ_status() == null || dto.getQ_status().isEmpty()) {
			dto.setQ_status("received");
		}
		
		if (dto.getQ_secret() == null || dto.getQ_secret().isEmpty()) {
			dto.setQ_secret("N");
		}
		//비회원 문의 로그인 관련
		
		boolean guestQuestion =
			    dto.getId() == null || dto.getId().trim().isEmpty();

			if (guestQuestion) {
			    if (dto.getQ_guestPhone() == null || dto.getQ_guestPhone().trim().isEmpty()) {
			        throw new RuntimeException("비회원 문의는 휴대폰 번호가 필요합니다.");
			    }

			    if (dto.getQ_pw() == null || dto.getQ_pw().trim().isEmpty()) {
			        throw new RuntimeException("비회원 문의는 비밀번호가 필요합니다.");
			    }
			    //FK 유지하기 위해서 비회원은 id를 비워둡니다.
			    dto.setId(null);
			} else {
			    int count = questionMapper.isMyCompanyFurniture(dto.getId(), dto.getF_code());

			    if (count > 0) {
			        throw new RuntimeException("자기 회사 상품에는 문의를 작성할 수 없습니다.");
			    }
			}
		questionMapper.insertData(dto);
	}
	public List<QuestionDTO> getMyQuestions(String id) throws Exception {
		return questionMapper.getMyQuestions(id);
	}
	
	public List<QuestionDTO> getListsByFCode(String f_code) throws Exception{
		return questionMapper.getListsByFCode(f_code);
	}
	
	public QuestionDTO getReadDataByQIdx(int q_idx) throws Exception{
		return questionMapper.getReadDataByQIdx(q_idx);
	}
	
	public void updateAnswer(QuestionDTO dto) throws Exception{
		questionMapper.updateAnswer(dto);
	}
	
	//답변이 달린 문의 수정 관하여
	public void updateData(QuestionDTO dto) throws Exception{
		QuestionDTO savedQuestion = questionMapper.getReadDataByQIdx(dto.getQ_idx());
		
		if(savedQuestion == null) {
			throw new RuntimeException("문의 정보를 찾을 수 없습니다.");
		}
		
		if(savedQuestion.getQ_answer() != null && !savedQuestion.getQ_answer().trim().isEmpty()) {
			throw new RuntimeException("답변이 등록된 문의는 수정할 수 없습니다.");
		}
		int updateCount = questionMapper.updateData(dto);
		
		if(updateCount == 0) {
			throw new RuntimeException("문의 수정에 실패했습니다.");
		}
	}
	
	
	//아이디로 삭제하면 안됨!!!!! -> 이 사람이 쓴 모든 글이 다 삭제됨
	public void deleteData(int q_idx) throws Exception{
		questionMapper.deleteData(q_idx);
	}
	
	//답변 관련
	public List<QuestionDTO> getCompanyQuestions(String c_id) throws Exception {
	    return questionMapper.getCompanyQuestions(c_id);
	}
	public void deleteAnswer(int q_idx) throws Exception {
	    questionMapper.deleteAnswer(q_idx);
	}


}
