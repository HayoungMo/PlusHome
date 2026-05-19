package com.spring.home;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.ImageDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.dto.QuestionDTO;
import com.spring.home.service.ImageService;
import com.spring.home.service.QuestionService;

@RestController
@RequestMapping("/question")
public class QuestionController {

	@Autowired
	private QuestionService questionService;

	@Autowired
	private ImageService imageService;

	// 상품별 문의 목록
	@GetMapping("/list")
	public List<QuestionDTO> getListsByFCode(@RequestParam String f_code) throws Exception {
		return questionService.getListsByFCode(f_code);
	}

	// 문의 상세 페이지(?)
	@GetMapping("/read")
	public QuestionDTO getReadDataByQIdx(@RequestParam int q_idx) throws Exception {
		return questionService.getReadDataByQIdx(q_idx);
	}

	// 문의 작성 페이지
	@PostMapping("/write")
	public QuestionDTO insertData(@RequestBody QuestionDTO dto) throws Exception {
		questionService.insertData(dto);
		return dto;
	}

	// 업체측 문의 답변 작성
	@PostMapping("/answer")
	public String updateAnswer(@RequestBody QuestionDTO dto) throws Exception {
		questionService.updateAnswer(dto);
		return "ok";
	}

	// 업체측 문의 답변 삭제
	@PostMapping("/answer/delete")
	public String deleteAnswer(@RequestParam int q_idx) throws Exception {
		questionService.deleteAnswer(q_idx);
		return "ok";
	}

	// 마이페이지에서 자신이 작성한 문의 글
	@GetMapping("/my")
	public List<QuestionDTO> getMyQuestions(@RequestParam String id) throws Exception {
		return questionService.getMyQuestions(id);
	}

	// 문의 글 삭제
	@PostMapping("/update")
	public String updateData(@RequestBody QuestionDTO dto) throws Exception {
		questionService.updateData(dto);
		return "ok";
	}

	// 문의 삭제
	@PostMapping("/delete")
	public String deleteData(@RequestParam int q_idx) throws Exception {
		questionService.deleteData(q_idx);
		return "ok";
	}

	// 업체가 봐야하는 문의 목록
	@GetMapping("/company")
	public List<QuestionDTO> getCompanyQuestions(@RequestParam String c_id) throws Exception {
		return questionService.getCompanyQuestions(c_id);
	}

	// 업체가 봐야하는 문의 목록
	@RequestMapping("/getQuestionListsWithImage")
	public Map<String, Object> getQuestionListsWithImage(@RequestParam String c_id) throws Exception {
		Map<String, Object> result = new HashMap<>();

		if (c_id == null || c_id.equals("")) {
			result.put("success", false);
			result.put("message", "검색에 필요한 회사 ID정보가 누락되었습니다.");
			result.put("error", "No C_ID");

			return result;
		}

		try {
			List<QuestionDTO> questionList = questionService.getCompanyQuestions(c_id);

			if (questionList == null || questionList.size() == 0) {
				result.put("success", true);
				result.put("message", "등록된 문의가 없습니다.");
				return result;
			}

			List<Map<String, Object>> questionWithImageList = new ArrayList<>();
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

			for (QuestionDTO dto : questionList) {
				ImageQueryDTO imageQuery = new ImageQueryDTO();
				imageQuery.setKind("QUESTION");
				imageQuery.setRange("");
				imageQuery.setA(dto.getF_code());
				imageQuery.setD(dto.getId());
				imageQuery.setIdx(-1);

				List<ImageDTO> imageList = imageService.getList(imageQuery);
				Map<String, Object> item = new HashMap<>();
				item.put("question", dto);
				item.put("image", imageList);

				questionWithImageList.add(item);
			}

			result.put("success", true);
			result.put("message", "조회에 성공하였습니다.");
			result.put("listSize", questionWithImageList.size());
			result.put("questionList", questionWithImageList);

		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "문의 조회를 위한 데이터 조회중 오류가 발생했습니다.");
			result.put("error", e.toString());
		}

		return result;
	}

}
