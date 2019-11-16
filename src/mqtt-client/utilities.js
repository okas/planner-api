export function toBuffer([...params]) {
  return Buffer.from(Float32Array.from(params)).buffer
}
