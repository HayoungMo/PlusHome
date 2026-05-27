import React from "react";
import { Button, Chip, Stack } from "@mui/material";

const MultiFilterBar = ({
  groups = [],
  selectedValues = {},
  onChange,
  onReset,
  resetLabel = "\uCD08\uAE30\uD654",
  className = "",
}) => {
  const handleOptionClick = (groupKey, nextValue) => {
    onChange?.({
      ...selectedValues,
      [groupKey]: selectedValues[groupKey] === nextValue ? "" : nextValue,
    });
  };

  const hasSelectedFilter = Object.values(selectedValues).some(Boolean);
  const rootClassName = ["multi-filterbar", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      {groups.map((group) => (
        <div className="multi-filterbar-row" key={group.key}>
          <span className="multi-filterbar-label">{group.label}</span>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(group.options || []).map((option) => {
              const isSelected = selectedValues[group.key] === option.value;

              return (
                <Chip
                  key={option.value}
                  label={option.title || option.label}
                  color={isSelected ? "primary" : "default"}
                  variant={isSelected ? "filled" : "outlined"}
                  onClick={() => handleOptionClick(group.key, option.value)}
                />
              );
            })}
          </Stack>
        </div>
      ))}

      {hasSelectedFilter && (
        <Button size="small" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
};

export default MultiFilterBar;
