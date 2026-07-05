export function todayStr(d?: Date): string {
	return (d ?? new Date()).toISOString().slice(0, 10);
}
