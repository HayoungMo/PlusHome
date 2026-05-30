import React from 'react';
import { Switch, FormGroup, FormControlLabel,FormControl, FormLabel } from '@mui/material';

/**
 * 공통 Switch 컴포넌트
 *
 * MUI Switch를 기반으로 만든 ON/OFF 상태 전환 컴포넌트입니다.
 * checked와 onChange를 외부 state와 연결하여 스위치 상태를 제어할 수 있으며,
 * label을 통해 스위치 그룹 제목을 표시할 수 있습니다.
 *
 * @param {Object} props
 * @param {string} [props.className] 컴포넌트 최상위 div에 적용할 className
 * @param {boolean} props.checked 스위치 선택 여부
 * @param {Function} props.onChange 스위치 상태 변경 시 실행할 함수
 * @param {string} [props.label] 스위치 영역에 표시할 라벨
 * @param {string} [props.name="switchMui"] Switch 컴포넌트의 name 속성 값
 * @param {boolean} [props.disabled=false] 스위치 비활성화 여부
 * @param {string | number} [props.width="200px"] 컴포넌트의 너비 값
 *
 * @returns {JSX.Element} ON/OFF 상태를 제어하는 Switch UI
 */
const SwitchMui = (props) => {
    const {className, checked, onChange, label, name, disabled, width} =props

    const switchName = name !== null && name !== "" && name !== undefined ? name : "switchMui";
    const isDisabled = disabled ? true : false;

    return (
        <div className={className} style={{
            width:width?width:"200px"}}>
            <FormControl>
                <FormLabel id={`switch-group-${switchName}`}>{label}</FormLabel>
                    <FormGroup aria-labelledby={`switch-group-${switchName}`}>
                        <FormControlLabel         
                            control={
                                <Switch
                                    name={switchName}
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

export default SwitchMui;