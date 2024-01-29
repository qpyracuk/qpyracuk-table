function t(): string | number | undefined {
	const { env, stdout, stderr } = process;
	if (stdout && stdout.columns) return stdout.columns;
	if (stderr && stderr.columns) return stderr.columns;
	if (env.COLUMNS) return env.LINES;
}
export default function getTerminalSize(): number | 'none' {
	try {
		const terminalSize = t();
		if (terminalSize !== undefined) {
			if (typeof terminalSize === 'number') {
				return terminalSize;
			} else if (typeof terminalSize === 'string') {
				return Number.parseInt(terminalSize, 10);
			}
		}
		return 'none';
	} catch {
		return 'none';
	}
}
