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
const FilterBar = (props) => {
  const { filterList = [], value = {}, onChange, onSubmit, setter } = props;
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
    >
      <Button
        variant="outlined"
        startIcon={<TuneIcon />}
        disabled={filterList.length === 0}
        onClick={() => setDialogOpenInFilterBar(true)}
      >
        {FILTER_TEXT.filter}
      </Button>

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
