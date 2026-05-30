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

/**
 * 좌우 이동형 Transfer List 컴포넌트
 *
 * 왼쪽 리스트와 오른쪽 리스트를 표시하고,
 * 체크된 항목 또는 전체 항목을 좌우로 이동시킬 수 있는 MUI 기반 컴포넌트입니다.
 * 항목 클릭 시 체크 상태를 토글하며, 필요하면 선택된 항목 데이터를 외부 state에 저장할 수 있습니다.
 *
 * @param {Object} props
 * @param {Array<Object>} props.listData 초기 왼쪽 리스트에 표시할 전체 데이터 배열
 * @param {string[]} props.textKey 리스트 항목에 표시할 데이터 key 목록
 * @param {Array<Object>} props.left 왼쪽 리스트 데이터
 * @param {Function} props.setLeft 왼쪽 리스트 데이터를 변경하는 setState 함수
 * @param {Array<Object>} props.right 오른쪽 리스트 데이터
 * @param {Function} props.setRight 오른쪽 리스트 데이터를 변경하는 setState 함수
 * @param {Object|null} props.selectedItem 현재 선택된 항목 데이터를 담는 state
 * @param {Function} props.setSelectedItem 항목 클릭 시 선택된 데이터를 저장하는 setState 함수
 *
 * @returns {JSX.Element} 좌우 이동이 가능한 Transfer List UI
 */
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
