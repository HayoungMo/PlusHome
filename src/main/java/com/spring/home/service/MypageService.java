package com.spring.home.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.mapper.MypageMapper;

@Service
public class MypageService {

	@Autowired
	private MypageMapper userMypageMapper;
	
}
