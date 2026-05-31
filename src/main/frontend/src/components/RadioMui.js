import React from 'react';
import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from "@mui/material";

/**
 * 공통 Radio 컴포넌트
 *
 * MUI RadioGroup을 기반으로 만든 단일 선택 라디오 버튼 그룹 컴포넌트입니다.
 * labelList 배열을 기준으로 라디오 옵션을 렌더링하며,
 * value와 onChange를 외부 state와 연결하여 선택 값을 제어할 수 있습니다.
 *
 * @param {Object} props
 * @param {string} [props.className] 컴포넌트 최상위 div에 적용할 className
 * @param {string | number} props.value 현재 선택된 라디오 값
 * @param {string} props.name RadioGroup의 name 속성 값
 * @param {string} [props.label] 라디오 그룹 상단에 표시할 라벨
 * @param {Object[]} [props.labelList=[]] 라디오 옵션 목록
 * @param {string | number} props.labelList[].value 실제 선택 값
 * @param {string} props.labelList[].title 화면에 표시할 옵션 텍스트
 * @param {string | number} [props.width="200px"] 컴포넌트의 너비 값
 * @param {Function} props.onChange 라디오 선택 값 변경 시 실행할 함수
 *
 * @returns {JSX.Element} 단일 선택 라디오 버튼 그룹 UI
 */
const RadioMui = (props) => {
    const {className,value,name,label, labelList, width,onChange} = props;
    
    return (
        <div className={className} style={{ width: width ? width : "200px" }}>
            <FormControl>
                <FormLabel id={`controlled-radio-buttons-${name}`}>{label}</FormLabel>
                <RadioGroup
                    aria-labelledby={`controlled-radio-buttons-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                >    
                    {labelList?.map((record)=>(
                            <FormControlLabel
                                key={`${name}-${record.value}`}
                                value={record.value}
                                control={<Radio/>}
                                label={record.title}/>
                        ))
                    }
                
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default RadioMui;