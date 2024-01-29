export type TCell = string;

export interface IRow {
	id: number;
	cells: TCell[];
}

export interface ITable {
	rows: IRow[];
}
