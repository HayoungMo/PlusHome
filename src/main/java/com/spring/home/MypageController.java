package com.spring.home;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.service.MypageService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/mypage/")
@RestController
public class MypageController {

	@Resource
	private MypageService userMypageService;
}
