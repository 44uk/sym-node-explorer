export const delay = (ms: number) => (
  new Promise<number>(resolve => setTimeout(() => resolve(ms), ms))
)
