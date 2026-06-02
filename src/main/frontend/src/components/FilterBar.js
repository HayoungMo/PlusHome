import React from "react";
import { Button, Chip } from "@mui/material";

const FILTER_TEXT = {
  reset: "초기화",
};

const FILTER_TYPE = {
  SINGLE: "single",
  MULTI: "multi",
};

const getFilterType = (filter) => {
  return filter?.type || FILTER_TYPE.SINGLE;
};

const isEmptyFilterValue = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  return value === "" || value === null || value === undefined;
};

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px 12px",
  },
  label: {
    minWidth: "72px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },
  chipList: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  selected: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
};

const FilterBar = (props) => {
  const {
    filterList = [],
    value = {},
    onChange,
    setter,
    onSubmit,
    children,
    className = "",
  } = props;
  const setFilterValue = onChange || setter;
  const rootClassName = ["filter-bar", className].filter(Boolean).join(" ");

  const selectedFilterList = filterList
    .flatMap((filter) => {
      const selectedValue = value?.[filter.key];

      if (isEmptyFilterValue(selectedValue)) return null;

      if (getFilterType(filter) === FILTER_TYPE.MULTI) {
        return (selectedValue || []).map((v) => {
          const selectedOption = filter.options?.find(
            (option) => option.value === v,
          );

          return {
            ...filter,
            selectedValue: v,
            selectedTitle: selectedOption?.title || selectedOption?.label || v,
          };
        });
      }

      const selectedOption = filter.options?.find(
        (option) => option.value === selectedValue,
      );

      return [
        {
          ...filter,
          selectedValue,
          selectedTitle:
            selectedOption?.title || selectedOption?.label || selectedValue,
        },
      ];
    })
    .filter(Boolean);

  const updateFilterValue = (nextValue) => {
    if (setFilterValue) setFilterValue(nextValue);
    if (onSubmit) onSubmit(nextValue);
  };

  const handleSelect = (filterKey, optionValue, type) => {
    const nextValue = { ...value };

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

      updateFilterValue(nextValue);
      return;
    }

    if (nextValue[filterKey] === optionValue) {
      delete nextValue[filterKey];
    } else {
      nextValue[filterKey] = optionValue;
    }

    updateFilterValue(nextValue);
  };

  const handleDeleteFilter = (filterKey, selectedValue, type = {}) => {
    const nextValue = { ...value };

    if (type === FILTER_TYPE.MULTI) {
      nextValue[filterKey] = (nextValue[filterKey] || []).filter(
        (item) => item !== selectedValue,
      );

      if (nextValue[filterKey].length === 0) {
        delete nextValue[filterKey];
      }
    } else {
      delete nextValue[filterKey];
    }

    updateFilterValue(nextValue);
  };

  return (
    <div className={rootClassName} style={styles.root}>
      {children}

      {filterList.length > 0 && (
        <div className="filter-bar-options" style={styles.options}>
          {filterList.map((filter) => (
            <div className="filter-bar-row" key={filter.key} style={styles.row}>
              <span className="filter-bar-label" style={styles.label}>
                {filter.title}
              </span>

              <div className="filter-bar-chip-list" style={styles.chipList}>
                {(filter.options || []).map((option) => {
                  const selected =
                    getFilterType(filter) === FILTER_TYPE.MULTI
                      ? (value[filter.key] || []).includes(option.value)
                      : value[filter.key] === option.value;

                  return (
                    <Chip
                      key={`${filter.key}_${option.value}`}
                      label={option.title || option.label}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFilterList.length > 0 && (
        <div className="filter-bar-selected" style={styles.selected}>
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

          <Button
            type="button"
            size="small"
            onClick={() => updateFilterValue({})}
          >
            {FILTER_TEXT.reset}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
