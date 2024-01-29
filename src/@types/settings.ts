import { DeepPartial } from './general';

export type THorisontalAlignment = 'left' | 'center' | 'right';
export type TVerticalAlignment = 'top' | 'center' | 'bottom';
export type TOrientation = 'horizontal' | 'vertical';

export interface IInnerSettings {
	horisontalAlignment: THorisontalAlignment;
	verticalAlignment: TVerticalAlignment;
	orientation: TOrientation;
	margin: number;
	wrap: boolean;
	maxWidth: 'Infinity' | 'auto' | number;
	maxDeep: number;
}

export type ISettings = DeepPartial<IInnerSettings>;
