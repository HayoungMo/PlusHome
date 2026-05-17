import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

function not(a, b) {
	return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
	return a.filter((value) => b.includes(value));
}

const TransferListMui = (props) => {
	const {
		listData = [],
		textKey = [],
		left = [],
		setLeft = null,
		right = [],
		setRight = null,
		selectedItem,
		setSelectedItem,
	} = props;
	const [checked, setChecked] = useState([]);

	const leftChecked = intersection(checked, left);
	const rightChecked = intersection(checked, right);

	const handleToggle = (value) => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);

        if(!setSelectedItem) return

        setSelectedItem(value)
	};

	const handleAllRight = () => {
		if (!setLeft) return;
		setRight(right.concat(left));
		setLeft([]);
	};

	const handleCheckedRight = () => {
		if (!setLeft) return;
		setRight(right.concat(leftChecked));
		setLeft(not(left, leftChecked));
		setChecked(not(checked, leftChecked));
	};

	const handleCheckedLeft = () => {
		if (!setLeft) return;
		setLeft(left.concat(rightChecked));
		setRight(not(right, rightChecked));
		setChecked(not(checked, rightChecked));
	};

	const handleAllLeft = () => {
		if (!setLeft) return;
		setLeft(left.concat(right));
		setRight([]);
	};

	useEffect(() => {
		if (!setLeft) return;
		setLeft(listData || []);
		setRight([]);
		setChecked([]);
	}, [listData]);

	const customList = (items) => (
		<Paper sx={{ width: 200, height: 230, overflow: "auto" }}>
			<List dense component="div" role="list">
				{items.map((value, index) => {
					const labelId = `transfer-list-item-${value}-label-${index}`;

					return (
						<ListItemButton
							textKey={value}
							role="listitem"
							onClick={handleToggle(value)}>
							<ListItemIcon>
								<Checkbox
									checked={checked.includes(value)}
									tabIndex={-1}
									disableRipple
									slotProps={{
										input: { "aria-labelledby": labelId },
									}}
								/>
							</ListItemIcon>
							<div>
								{textKey.map((record, keyIndex) => {
									if (index > 0)
										return (
											<ListItemText
												id={labelId}
												primary={`${value[record]}`}
											/>
										);
									else
										return (
											<ListItemText
												id={labelId}
												primary={`${value[record]}`}
											/>
										);
								})}
							</div>
						</ListItemButton>
					);
				})}
			</List>
		</Paper>
	);

	return (
		<Grid container spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
			<Grid>{customList(left)}</Grid>
			<Stack>
				<Button
					sx={{ my: 0.5 }}
					variant="outlined"
					size="small"
					onClick={handleAllRight}
					disabled={left.length === 0}
					aria-label="move all right">
					≫
				</Button>
				<Button
					sx={{ my: 0.5 }}
					variant="outlined"
					size="small"
					onClick={handleCheckedRight}
					disabled={leftChecked.length === 0}
					aria-label="move selected right">
					&gt;
				</Button>
				<Button
					sx={{ my: 0.5 }}
					variant="outlined"
					size="small"
					onClick={handleCheckedLeft}
					disabled={rightChecked.length === 0}
					aria-label="move selected left">
					&lt;
				</Button>
				<Button
					sx={{ my: 0.5 }}
					variant="outlined"
					size="small"
					onClick={handleAllLeft}
					disabled={right.length === 0}
					aria-label="move all left">
					≪
				</Button>
			</Stack>
			<Grid>{customList(right)}</Grid>
		</Grid>
	);
};

export default TransferListMui;
