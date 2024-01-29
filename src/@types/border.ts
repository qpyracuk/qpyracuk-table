import { DeepPartial } from './general';

export interface IInnerBorder {
	left: string;
	top: string;
	right: string;
	bottom: string;
	centerHorisontal: string;
	centerVertical: string;

	leftJoin: string;
	centerJoin: string;
	rightJoin: string;
	topJoin: string;
	bottomJoin: string;

	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
}

export type IBorder = DeepPartial<IInnerBorder>;
