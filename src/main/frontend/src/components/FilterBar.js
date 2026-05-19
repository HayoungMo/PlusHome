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

const FilterBar = (props) => {
	const { filterList = [], value = {}, onChange, setter } = props;
	const setFilterValue = onChange || setter;
	const [dialogOpenInFilterBar, setDialogOpenInFilterBar] = useState(false);

	const selectedFilterList = filterList
		.map((filter) => {
			const selectedValue = value?.[filter.key];
			const selectedOption = filter.options?.find((option) => option.value === selectedValue);

			if (!selectedValue) return null;

			return {
				...filter,
				selectedTitle: selectedOption?.title || selectedValue,
			};
		})
		.filter(Boolean);

	const handleDeleteFilter = (filterKey) => {
		if (!setFilterValue) return;

		const nextValue = { ...value };
		delete nextValue[filterKey];
		setFilterValue(nextValue);
	};

	return (
		<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
			<Button
				variant="outlined"
				startIcon={<TuneIcon />}
				disabled={filterList.length === 0}
				onClick={() => setDialogOpenInFilterBar(true)}>
				{FILTER_TEXT.filter}
			</Button>

			{selectedFilterList.map((filter) => (
				<Chip
					key={`${filter.key}_${filter.selectedTitle}`}
					label={`${filter.title}: ${filter.selectedTitle}`}
					onDelete={() => handleDeleteFilter(filter.key)}
					variant="outlined"
				/>
			))}

			{selectedFilterList.length > 0 && (
				<Button size="small" onClick={() => setFilterValue && setFilterValue({})}>
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
				/>
			)}
		</Stack>
	);
};

const FilterListDialog = (props) => {
	const { open, setOpen, filterList, value, onChange } = props;
	const [tempValue, setTempValue] = useState(value || {});

	useEffect(() => {
		setTempValue(value || {});
	}, [value, open]);

	const handleSelect = (filterKey, optionValue) => {
		setTempValue((prev) => {
			const nextValue = { ...prev };

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
									const selected = tempValue[filter.key] === option.value;

									return (
										<Chip
											key={`${filter.key}_${option.value}`}
											label={option.title}
											color={selected ? "primary" : "default"}
											variant={selected ? "filled" : "outlined"}
											onClick={() => handleSelect(filter.key, option.value)}
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
