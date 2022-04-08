export type HSLA = [number, number, number, number]

/** 요하네스 이텐 색상환에서 추출한 무지개색 중 색조 채널
 *
 * 참고: https://observablehq.com/@gunggmee/ryb-color-wheel
 */
export const ITTEN_HUES: readonly number[] = [
  0, 357, 348, 334, 316, 300, 297, 285, 263, 231, 213, 210, 197, 171, 151, 141, 138, 129, 102, 80,
  66, 60, 58, 53, 44, 36, 31, 29, 25, 17, 9, 2,
]

/** 이텐 색상환에서 deg 각도의 색조 얻어오기 */
export function ittenHue(deg: number): number {
  return ITTEN_HUES[(((deg % 360) / 360) * ITTEN_HUES.length) | 0]
}
