export const enforceExhaustive = <T>(item: never): T => { throw new Error('Exhaustive case reached') }
