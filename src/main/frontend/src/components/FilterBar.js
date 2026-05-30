import React, { useEffect, useState } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

const FILTER_TEXT = {
  filter: "필터",
  reset: "초기화",
  cancel: "취소",
  save: "저장",
};

const FILTER_TYPE = {
  SINGLE: "single",
  MULTI: "multi",
};
const getFilterType = (filter) => {
  return filter?.type || FILTER_TYPE.SINGLE;
};

/**
 * 필터 바 컴포넌트
 *
 * 필터 버튼, 선택된 필터 Chip 목록, 초기화 버튼을 표시하는 공통 필터 UI 컴포넌트입니다.
 * filterList를 기준으로 필터 항목을 구성하며,
 * 사용자가 선택한 필터 값은 value 객체로 관리됩니다.
 * 필터 버튼 클릭 시 FilterListDialog가 열리고,
 * 선택된 필터는 Chip 형태로 표시되어 개별 삭제할 수 있습니다.
 *
 * @param {Object} props
 * @param {Object[]} [props.filterList=[]] 필터 설정 목록
 * @param {string} props.filterList[].key 필터 값을 저장할 key
 * @param {string} props.filterList[].title 필터 화면에 표시할 제목
 * @param {"single" | "multi"} [props.filterList[].type="single"] 단일 선택 또는 다중 선택 여부
 * @param {Object[]} [props.filterList[].options=[]] 필터 선택 옵션 목록
 * @param {string} props.filterList[].options[].title 옵션에 표시할 텍스트
 * @param {string | number} props.filterList[].options[].value 실제 필터 값
 * @param {Object} [props.value={}] 현재 선택된 필터 값 객체
 * @param {Function} [props.onChange] 필터 값 변경 시 실행할 함수
 * @param {Function} [props.setter] onChange 대신 사용할 수 있는 필터 값 변경 함수
 * @param {Function} [props.onSubmit] 필터 저장 시 추가로 실행할 함수
 * @param {React.ReactNode} [props.children] 필터 버튼 앞에 표시할 추가 요소
 * @param {string} [props.className=""] 최상위 Stack에 추가로 적용할 className
 *
 * @returns {JSX.Element} 필터 버튼, 선택된 필터 Chip, 초기화 버튼이 포함된 필터 바 UI
 */
const FilterBar = (props) => {
  const { filterList = [], value = {}, onChange, setter, onSubmit, children, className = "" } = props;
  const setFilterValue = onChange || setter;
  const [dialogOpenInFilterBar, setDialogOpenInFilterBar] = useState(false);
  const selectedFilterList = filterList
    .flatMap((filter) => {
      const selectedValue = value?.[filter.key];

      if (!selectedValue) return null;

      if (getFilterType(filter) === FILTER_TYPE.MULTI) {
        return (selectedValue || []).map((v) => {
          const selectedOption = filter.options?.find(
            (option) => option.value === v,
          );

          return {
            ...filter,
            selectedValue: v,
            selectedTitle: selectedOption?.title || v,
          };
        });
      } else {
        // single
        const selectedOption = filter.options?.find(
          (option) => option.value === selectedValue,
        );
        return [
          {
            ...filter,
            selectedValue,
            selectedTitle: selectedOption?.title || selectedValue,
          },
        ];
      }
    })
    .filter(Boolean);

  const handleDeleteFilter = (filterKey, selectedValue, type = {}) => {
    if (!setFilterValue) return;
    const nextValue = { ...value };
    // multi
    if (type === FILTER_TYPE.MULTI) {
      nextValue[filterKey] = (nextValue[filterKey] || []).filter(
        (item) => item !== selectedValue,
      );

      if (nextValue[filterKey].length === 0) {
        delete nextValue[filterKey];
      }
    }

    // single
    else {
      delete nextValue[filterKey];
    }

    setFilterValue(nextValue);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      className={className}
    >
      {children}

      {filterList.length > 0 && (
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={() => setDialogOpenInFilterBar(true)}
        >
          {FILTER_TEXT.filter}
        </Button>
      )}

      {selectedFilterList.map((filter) => (
        <Chip
          key={`${filter.key}_${filter.selectedTitle}`}
          label={`${filter.title}: ${filter.selectedTitle}`}
          onDelete={() =>
            handleDeleteFilter(
              filter.key,
              filter.selectedValue,
              getFilterType(filter),
            )
          }
          variant="outlined"
        />
      ))}

      {selectedFilterList.length > 0 && (
        <Button
          size="small"
          onClick={() => setFilterValue && setFilterValue({})}
        >
          {FILTER_TEXT.reset}
        </Button>
      )}

      {dialogOpenInFilterBar && (
        <FilterListDialog
          open={dialogOpenInFilterBar}
          setOpen={setDialogOpenInFilterBar}
          filterList={filterList}
          value={value}
          onChange={setFilterValue}
          onSubmit={onSubmit}
        />
      )}
    </Stack>
  );
};

const FilterListDialog = (props) => {
  const { open, setOpen, filterList, value, onChange, onSubmit } = props;
  const [tempValue, setTempValue] = useState(value || {});

  useEffect(() => {
    setTempValue(value || {});
  }, [value, open]);

  const handleSelect = (filterKey, optionValue, type) => {
    setTempValue((prev) => {
      const nextValue = { ...prev };

      // multi
      if (type === FILTER_TYPE.MULTI) {
        const currentArray = nextValue[filterKey] || [];

        const exists = currentArray.includes(optionValue);

        if (exists) {
          nextValue[filterKey] = currentArray.filter(
            (item) => item !== optionValue,
          );

          if (nextValue[filterKey].length === 0) {
            delete nextValue[filterKey];
          }
        } else {
          nextValue[filterKey] = [...currentArray, optionValue];
        }

        return nextValue;
      }

      // single
      if (nextValue[filterKey] === optionValue) {
        delete nextValue[filterKey];
      } else {
        nextValue[filterKey] = optionValue;
      }

      return nextValue;
    });
  };

  const handleSave = () => {
    if (onChange) onChange(tempValue);
    if (onSubmit) onSubmit(tempValue);
    setOpen(false);
  };

  const handleReset = () => {
    setTempValue({});
  };

  return (
    <Dialog onClose={() => setOpen(false)} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{FILTER_TEXT.filter}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {filterList.map((filter) => (
            <Box key={filter.key}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {filter.title}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(filter.options || []).map((option) => {
                  const selected =
                    getFilterType(filter) === FILTER_TYPE.MULTI
                      ? (tempValue[filter.key] || []).includes(option.value)
                      : tempValue[filter.key] === option.value;

                  return (
                    <Chip
                      key={`${filter.key}_${option.value}`}
                      label={option.title}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      onClick={() =>
                        handleSelect(
                          filter.key,
                          option.value,
                          getFilterType(filter),
                        )
                      }
                    />
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          {FILTER_TEXT.reset}
        </Button>
        <Button onClick={() => setOpen(false)} color="error" variant="outlined">
          {FILTER_TEXT.cancel}
        </Button>
        <Button onClick={handleSave} color="primary" variant="outlined">
          {FILTER_TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterBar;
