import React from 'react';
import {Checkbox, FormControl,FormControlLabel,FormGroup,FormLabel} from '@mui/material'; 

/**
 * 공통 Checkbox 컴포넌트
 *
 * MUI Checkbox를 기반으로 만든 단일 체크박스 컴포넌트입니다.
 * label을 통해 체크박스 그룹 제목을 표시하고,
 * checked와 onChange를 외부 state와 연결하여 체크 상태를 제어할 수 있습니다.
 *
 * @param {Object} props
 * @param {string} props.className 컴포넌트 최상위 div에 적용할 className
 * @param {boolean} props.checked 체크박스 선택 여부
 * @param {Function} props.onChange 체크 상태 변경 시 실행할 함수
 * @param {string} props.label 체크박스 영역에 표시할 라벨
 * @param {string} props.name 체크박스 name 속성 값
 * @param {boolean} props.disabled 체크박스 비활성화 여부
 * @param {string | number} props.width 컴포넌트의 너비 값
 *
 * @returns {JSX.Element} 단일 체크박스 UI
 */
const CheckboxMui = (props) => {
    const {className, checked, onChange, label, name, disabled, width} = props 
    
    const checkboxName = name !== null && name !== "" && name !== undefined ? name : "checkboxMui";
    const isDisabled = disabled ? true : false;

    return (
        <div className={className} style={{
            width:width?width:"200px"
        }}>
            <FormControl>
                <FormLabel id={`checkbox-group-${checkboxName}`}>{label}</FormLabel>
                <FormGroup aria-labelledby={`checkbox-group-${checkboxName}`}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name={checkboxName}
                                checked={checked}
                                onChange={onChange}
                                disabled={isDisabled}
                            />
                        }>
                    </FormControlLabel>
                </FormGroup>
            </FormControl>
            
        </div>
    );
};

export default CheckboxMui;