package com.spring.home.util;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class LogComponent {
	private static final Logger logger = LoggerFactory.getLogger(LogComponent.class);

	// 1. 적용 범위 설정: 모든 RestController 또는 Controller의 메소드
	@Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || within(@org.springframework.stereotype.Controller *)")
	public void controllerMethods() {
	}

	// 2. 실행 전 로그 출력 양식 정의
	@Before("controllerMethods()")
	public void logBefore(JoinPoint joinPoint) {
		String className = joinPoint.getTarget().getClass().getSimpleName();
		String methodName = joinPoint.getSignature().getName();

		logger.info(
				"\n==========================================\n [ 실행 메소드 ] : {}.{}()\n==========================================",
				className, methodName);
	}
}
