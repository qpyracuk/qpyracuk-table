import { IInnerSettings, ISettings } from '@/@types/settings';

import { IInnerBorder } from '@/@types/border';
import { IInnerSettings } from '@/@types/settings';
import getTerminalSize from '@/libs/get-terminal-size';

interface TSlice {
	start: number;
	finish: number;
	columnWidth: number[];
	slice: ICell[][];
}

interface ICell {
	width: number;
	height: number;
	lines: string[];
}

export default class Table {
	private _table: string[][];
	private _innerTable: ICell[][];
	private _columnNumber: number;
	private _rowNumber: number;

	private _columnsWidth: number[];
	private _rowsHeight: number[];

	private _settings: IInnerSettings;

	private _maxWidth: 'Infinity' | number;

	private _slices: TSlice[];

	private _borders: IInnerBorder = {
		left: '',
		top: '',
		right: '',
		bottom: '',

		centerHorisontal: '',
		centerVertical: '',
		centerJoin: '',

		leftJoin: '',

		rightJoin: '',
		topJoin: '',
		bottomJoin: '',

		topLeft: '',
		topRight: '',
		bottomLeft: '',
		bottomRight: '',
	};

	_chunks: string[] = [];

	constructor(header: string[], body: string[][], settings: IInnerSettings) {
		this._settings = settings;
		this._table = this._prepareTable(header, body);
		this._columnNumber = this._table[0].length;
		this._rowNumber = this._table.length;
		this._columnsWidth = new Array(this._columnNumber);
		this._rowsHeight = new Array(this._rowNumber);
		this._maxWidth = this._calculateMaxWidth();
		// Определяем максимальную ширину, доступную для таблицы
		this._innerTable = this._prepareTableData();
		// Разделяем таблицу на чанки,
		this._slices = this._sliceTable();
		// Генерируем таблицы из чанков
		for (let i = 0; i < this._slices.length; i++) {
			this._chunks.push(this._generateTable(this._slices[i]));
		}
	}

	/**
	 * @description Returns the table as a string
	 * @returns {string} table
	 */
	public get(): string {
		return this._chunks.join('\n');
	}

	/**
	 * @description Returns the table in chunks
	 * @returns {string[]} table chunks
	 */
	public getChunks(): string[] {
		return this._chunks;
	}

	private _generateTable(slice: TSlice): string {
		let borders = this._getHorisontalBorders(slice);
		let result = '';
		result += borders.top;
		for (let i = 0; i < slice.slice.length; i++) {
			result += this._getRows(slice);
		}
		result += borders.bottom;
		return result;
	}

	private _getRows(slice: TSlice): string {
		let table = slice.slice;
		let row: ICell[], cell: ICell, width: number, height: number;
		for (let i = 0; i < table.length; i++) {
			row = table[i];
			height = this._rowsHeight[i];
			for (let j = 0; j < row.length; j++) {
				cell = row[j];
				width = slice.columnWidth[j];

				for (let l = 0; l < cell.lines.length; l++) {
					if (cell.height !== height) {
						let dHeight = height - cell.height;
						switch (this._settings.verticalAlignment) {
							case 'top':
								cell.lines.unshift(...this._getEmptyLines(dHeight, width));
								break;
							case 'center':
								{
									let dUnshift = ~~(dHeight / 2);
									cell.lines.unshift(...this._getEmptyLines(dUnshift, width));
									let dPush = dHeight - dUnshift;
									cell.lines.push(...this._getEmptyLines(dPush, width));
								}
								break;
							case 'bottom':
								cell.lines.push(...this._getEmptyLines(dHeight, width));
								break;
						}
					}
				}
			}
		}
	}

	private _getEmptyLines(number: number, length: number): string[] {
		let lines: string[] = new Array(number);
		for (let i = 0; i < number; i++) {
			lines[i] = ' '.repeat(length);
		}
		return lines;
	}

	private _fillEmptyPlace(lines: string[], width: number): string[] {
		for (let i = 0; i < lines.length; i++) {
			let dWidth = width - lines[i].length;
			switch (this._settings.horisontalAlignment) {
				case 'left':
					lines[i] = ' '.repeat(dWidth) + lines[i];
					break;
				case 'center':
					{
						let dUnshift = ~~(dHeight / 2);
						cell.lines.unshift(...this._getEmptyLines(dUnshift, width));
						let dPush = dHeight - dUnshift;
						cell.lines.push(...this._getEmptyLines(dPush, width));
					}
					break;
				case 'right':
					lines[i] = lines[i] + ' '.repeat(dWidth);
					break;
			}
		}
		return lines;
	}

	private _getHorisontalBorders(slice: TSlice) {
		let top = this._borders.topLeft;
		let center = this._borders.leftJoin;
		let bottom = this._borders.bottomLeft;
		let number = slice.finish - slice.start;
		let columnsWidth = this._columnsWidth.slice(slice.start, slice.finish - slice.start);
		for (let i = 0; i < number; i++) {
			if ((this._borders.top === this._borders.centerHorisontal) === this._borders.bottom) {
			}
			top += this._borders.top.repeat(columnsWidth[i]) + this._borders.topJoin;
			center += this._borders.centerHorisontal.repeat(columnsWidth[i]) + this._borders.topJoin;
			bottom += this._borders.bottom.repeat(columnsWidth[i]) + this._borders.bottomJoin;
		}
		top += this._borders.top.repeat(columnsWidth[number]) + this._borders.topRight + '\n';
		bottom += this._borders.bottom.repeat(columnsWidth[number]) + this._borders.bottomRight;
		return {
			top,
			bottom,
		};
	}

	_sliceTable(): TSlice[] {
		if (this._maxWidth === 'Infinity') {
			return [
				{
					start: 0,
					finish: this._columnsWidth.length,
					columnWidth: this._columnsWidth,
					slice: this._innerTable,
				},
			];
		} else {
			let slices: TSlice[] = [];
			let lastIndex = 0;
			let accumulator = 0;
			for (let i = 0; i < this._columnsWidth.length; i++) {
				if (accumulator > this._maxWidth) {
					slices.push({
						start: lastIndex,
						finish: i,
						columnWidth: this._columnsWidth.slice(lastIndex, i - lastIndex),
						slice: this._slicer(lastIndex, i),
					});
					accumulator = 0;
					lastIndex = i;
				}
				accumulator += this._columnsWidth[i];
			}
			if (accumulator > 0) {
				slices.push({
					start: lastIndex,
					finish: this._columnsWidth.length,
					columnWidth: this._columnsWidth.slice(lastIndex, this._columnsWidth.length - lastIndex),
					slice: this._slicer(lastIndex, this._columnsWidth.length),
				});
			}
			return slices;
		}
	}

	private _slicer(start: number, finish: number): ICell[][] {
		let slice = new Array(this._innerTable.length);
		for (let i = 0; i < this._innerTable.length; i++) {
			slice[i] = this._innerTable[i].slice(start, finish);
		}
		return slice;
	}

	private _prepareTableData(): ICell[][] {
		const columnNumber = this._table[0].length;
		const rowNumber = this._table.length;
		let table = new Array(rowNumber);
		for (let i = 0; i < rowNumber; i++) {
			table[i] = new Array(columnNumber);
			for (let j = 0; j < columnNumber; j++) {
				let cell = this._cellAnalizator(this._table[i][j]);
				table[i][j] = cell;
				if (this._columnsWidth[j] < cell.width + +this._settings.margin) this._columnsWidth[j] = cell.width + this._settings.margin;
				if (this._rowsHeight[i] < cell.height + this._settings.margin) this._rowsHeight[i] = cell.width + this._settings.margin;
			}
		}
		return table;
	}

	private _calculateMaxWidth() {
		const maxWidth = this._settings.maxWidth;
		if (maxWidth !== undefined) {
			switch (maxWidth) {
				case 'auto': {
					let terminalSize = getTerminalSize();
					if (terminalSize !== 'none') {
						return terminalSize;
					} else return 'Infinity';
				}
				case 'Infinity':
					return 'Infinity';
				default:
					if (typeof this._settings.maxWidth === 'number' && this._settings.maxWidth >= 10) {
						return this._settings.maxWidth;
					} else {
						return 'Infinity';
					}
			}
		} else return 'Infinity';
	}

	private _cellAnalizator(cell: string): {
		width: number;
		height: number;
		lines: string[];
	} {
		let width = 0,
			height = 0;
		let lines = cell.replace(/\t/g, '   ').replace(/\v/g, '\n\n').split(/\n/g);
		for (let i = 0; i < lines.length; i++) {
			lines[i] = lines[i].replace(/[\x00-\x1F\x7F]/g, '').trim();
			if (width < lines[i].length) width = lines[i].length;
		}
		height = lines.length;
		return {
			width,
			height,
			lines,
		};
	}

	private _prepareTable(header: string[], body: string[][]): string[][] {
		let table = [header, ...body];
		if (this._settings.orientation === 'vertical') {
			return table;
		} else {
			let cRows = table.length;
			let cCols = header.length;
			let reverseTable = new Array(cCols);
			for (let i = 0; i < cCols; i++) {
				reverseTable[i] = new Array(cRows);
				for (let j = 1; j < cRows; j++) {
					reverseTable[i][j] = table[j][i];
				}
			}
			return reverseTable;
		}
	}
}

const HORISONTAL_ALIGNMENT = new Set(['left', 'center', 'right']);
const VERTICAL_ALIGNMENT = new Set(['top', 'center', 'bottom']);
const ORIENTATION = new Set(['horizontal', 'vertical']);

const PRIMITIVE = new Set(['number', 'string', 'boolean', 'symbol']);
function isPrimitive(value: any) {
	return PRIMITIVE.has(typeof value);
}

export default class Table {
	private _settings: IInnerSettings = {
		horisontalAlignment: 'left',
		verticalAlignment: 'top',
		orientation: 'vertical',
		margin: 0,
		wrap: false,
		maxWidth: 'Infinity',
		maxDeep: 1,
	};

	constructor(settings: ISettings) {
		if (settings !== undefined) {
			if (settings.horisontalAlignment !== undefined) {
				if (typeof settings.horisontalAlignment === 'string') {
					if (HORISONTAL_ALIGNMENT.has(settings.horisontalAlignment)) {
						this._settings.horisontalAlignment = settings.horisontalAlignment;
					} else {
						throw new Error("Invalid value for parameter horizontalAlignment. Pass horisontalAlignment: 'left' | 'center' | 'right'");
					}
				} else {
					throw new Error("Invalid type for parameter horizontalAlignment. Pass horisontalAlignment: 'left' | 'center' | 'right'");
				}
			}

			if (settings.verticalAlignment !== undefined) {
				if (typeof settings.verticalAlignment === 'string') {
					if (VERTICAL_ALIGNMENT.has(settings.verticalAlignment)) {
						this._settings.verticalAlignment = settings.verticalAlignment;
					} else {
						throw new Error("Invalid value for parameter verticalAlignment. Pass verticalAlignment: 'top' | 'center' | 'bottom'");
					}
				} else {
					throw new Error("Invalid type for parameter verticalAlignment. Pass verticalAlignment: 'top' | 'center' | 'bottom'");
				}
			}

			if (settings.orientation !== undefined) {
				if (typeof settings.orientation === 'string') {
					if (ORIENTATION.has(settings.orientation)) {
						this._settings.orientation = settings.orientation;
					} else {
						throw new Error("Invalid value for parameter orientation. Pass orientation: 'horizontal' | 'vertical'");
					}
				} else {
					throw new Error("Invalid type for parameter orientation. Pass orientation: 'horizontal' | 'vertical'");
				}
			}

			if (settings.orientation !== undefined) {
				if (typeof settings.orientation === 'string') {
					if (ORIENTATION.has(settings.orientation)) {
						this._settings.orientation = settings.orientation;
					} else {
						throw new Error("Invalid value for parameter orientation. Pass orientation: 'horizontal' | 'vertical'");
					}
				} else {
					throw new Error("Invalid type for parameter orientation. Pass orientation: 'horizontal' | 'vertical'");
				}
			}

			if (settings.margin !== undefined) {
				if (typeof settings.margin === 'number') {
					if (settings.margin >= 0) {
						this._settings.margin = settings.margin;
					} else {
						throw new Error('Invalid value for parameter margin. Pass margin: number > 0');
					}
				} else {
					throw new Error('Invalid type for parameter margin. Pass margin: number > 0');
				}
			}

			if (settings.wrap !== undefined) {
				if (typeof settings.wrap === 'boolean') {
					this._settings.wrap = settings.wrap;
				} else {
					throw new Error('Invalid type for parameter wrap. Pass wrap: boolean');
				}
			}

			if (settings.maxWidth !== undefined) {
				if (typeof settings.maxWidth === 'number') {
					if (settings.maxWidth >= 10) {
						this._settings.maxWidth = settings.maxWidth;
					} else {
						throw new Error('Invalid value for parameter maxWidth. Pass maxWidth: number >= 10');
					}
				} else {
					if (settings.maxWidth === 'Infinity') this._settings.maxWidth = settings.maxWidth;
					else if (settings.maxWidth === 'auto') this._settings.maxWidth = settings.maxWidth;
					else {
						throw new Error('Invalid type for parameter maxWidth. Pass maxWidth: number >= 10');
					}
				}
			}

			if (settings.maxDeep !== undefined) {
				if (typeof settings.maxDeep === 'number') {
					if (settings.maxDeep > 0) {
						this._settings.maxDeep = settings.maxDeep;
					} else {
						throw new Error('Invalid value for parameter maxDeep. Pass maxDeep: number > 0');
					}
				} else {
					throw new Error('Invalid type for parameter maxDeep. Pass maxWidth: number > 0');
				}
			}
		}
	}

	public serialize(node: any | any[], deep: number = 1): string {
		if (deep <= this._settings.maxDeep) {
			const schemaSet: Set<string> = new Set();

			let keys: string[];
			for (let i = 0; i < node.length; i++) {
				keys = Object.keys(node[i]);
				for (let j = 0; j < keys.length; j++) {
					schemaSet.add(keys[j]);
				}
			}
			const schema: string[] = [...schemaSet];

			const innerTable: string[][] = [];
			let innerRow: string[] = [];
			for (let i = 0; i < node.length; i++) {
				innerRow = new Array(schema.length);
				for (let j = 0; j < schema.length; j++) {
					let row = node[i];
					if (row !== undefined) {
						let field = schema[j];
						if (row[field] !== undefined) {
							if (isPrimitive(typeof node[i][j])) {
								innerRow[j] = `${node[i][j]}`;
							} else if (node[i][j] instanceof Array) {
								innerRow[j] = this.serialize(node[i][j], deep + 1);
							} else if (node[i][j] instanceof Map) {
								let map: { key: string; value: any }[] = [];
								node[i][j].forEach((value: any, key: any) => {
									map.push({ key, value });
								});
								innerRow[j] = this.serialize(map, deep + 1);
							} else if (node[i][j] instanceof Set) {
								innerRow[j] = this.serialize([...node[i][j]], deep + 1);
							} else if (typeof node[i][j] === 'function') {
								innerRow[j] = node[i][j]();
							} else if (typeof [node[i][j]] === 'object') {
								innerRow[j] = this.serialize(node[i][j], deep + 1);
							} else innerRow[j] = '';
						}
					}
				}
				innerTable.push(innerRow);
			}
		} else return `${node}`;
		return new Table(schema, innerTable).get(this._settings);
	}
}
