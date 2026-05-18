package com.spring.home;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.home.dto.ChatRequestDTO;


@RestController
@RequestMapping("/chatgpt")
public class ChatGPTController {

    @Value("${openai.api.key}")
    private String apiKey;

    @PostMapping("/chat")
    public String chat(@RequestBody ChatRequestDTO dto)
            throws Exception {

        RestTemplate restTemplate = new RestTemplate();

        String url =
                "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(apiKey);

        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();

        body.put("model", "gpt-4.1-mini");

        List<Map<String, String>> messages =
                new ArrayList<>();

        Map<String, String> system =
                new HashMap<>();

        system.put("role", "system");
        system.put("content",
                "너는 인테리어 추천 전문가 AI다. "
                + "추천 점수는 공개해서는 안 된다. "
                + "1000자 이상으로 늘어지는 대답은 해서 안된다. "
                + "만일 1000자가 넘어가게 된다면, 올바르게 문장을 끝내라");

        Map<String, String> user =
                new HashMap<>();

        user.put("role", "user");
        user.put("content", dto.getPrompt());

        messages.add(system);
        messages.add(user);

        body.put("messages", messages);

        body.put("max_tokens", 300);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        ObjectMapper mapper = new ObjectMapper();

        JsonNode root =
                mapper.readTree(response.getBody());

        String result =
                root.get("choices")
                        .get(0)
                        .get("message")
                        .get("content")
                        .asText();

        return result;
    }    
    
    private String listToString(Object obj){

        if(obj instanceof List<?>){

            List<?> list = (List<?>) obj;

            return String.join(
                ", ",
                list.stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList())
            );
        }

        return String.valueOf(obj);
    }

    
    @PostMapping("/companyanalysis")
    public String analysis(
        @RequestBody Map<String, Object> data
    ) throws Exception{
    	
    	System.out.println(data);
    	
    	String prompt =
    		    "다음은 인테리어 업체의 특징 데이터입니다.\n\n"

    		    + "[업체 특징]\n"

    		    + "- 집 종류: "
    		    + listToString(data.get("housingType")) + "\n"

    		    + "- 시공 가능 공간: "
    		    + listToString(data.get("spaces")) + "\n"

    		    + "- 예산대: "
    		    + listToString(data.get("budget")) + "\n"

    		    + "- 시공 일정: "
    		    + listToString(data.get("schedule")) + "\n"

    		    + "- 시공 목적: "
    		    + listToString(data.get("purpose")) + "\n"

    		    + "- 집 상태: "
    		    + listToString(data.get("houseCondition")) + "\n"

    		    + "- 집 크기: "
    		    + listToString(data.get("areaSize")) + "\n"

    		    + "- 아파트 시공 사례 수: "
    		    + data.get("apt") + "\n"

    		    + "- 빌라 시공 사례 수: "
    		    + data.get("villa") + "\n"

    		    + "- 오피스텔 시공 사례 수: "
    		    + data.get("officetel") + "\n"

    		    + "- 주택 시공 사례 수: "
    		    + data.get("house") + "\n\n"

    		    + "위 데이터를 기반으로\n"
    		    + "이 업체의 특징과 강점을\n"
    		    + "자연스럽게 설명해주세요.";

    	ChatRequestDTO dto = new ChatRequestDTO();
    	dto.setPrompt(prompt);
    	System.out.println("dto" + dto.getPrompt());
    	return chat(dto);
    }
    
    @PostMapping("/recommend")
    public String recommend(
        @RequestBody Map<String, Object> data
    ) throws Exception{    	
    	
    	
    	String prompt =

    		    "사용자 정보:\n"
    		    + listToString(data.get("answers")) +

    		    "\n\n업체 정보:\n"
    		    + listToString(data.get("company")) +

    		    "\n\n업체 특징:\n"
    		    + listToString(data.get("tags"))  +

    		    "\n\n추천 점수:"
    		    + listToString(data.get("score"))  +

    		    "\n\n"

    		    + "이 업체가 사용자에게 적합한 이유를 설명해주세요.";

    	ChatRequestDTO dto = new ChatRequestDTO();
    	dto.setPrompt(prompt);
    	System.out.println("dto" + dto.getPrompt());
    	
    	return chat(dto);
    }
}