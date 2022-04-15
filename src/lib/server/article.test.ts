import dedent from 'dedent'
import { describe, expect, test } from 'vitest'

import { type ArticleMeta, extractMeta } from './article'

describe('extractMeta()', () => {
  test('Basic', () => {
    const md = dedent`
      ---
      title: TITLE
      summary: SUMMARY
      publishedAt: '2022-04-01'
      draft: true
      ---
      Hello
    `
    const actual = extractMeta('ID', md, new Date('2022-04-01T00:00:00.000Z'))
    const expected: ArticleMeta = {
      id: 'ID',
      title: 'TITLE',
      summary: 'SUMMARY',
      publishedAt: '2022-04-01',
      modifiedAt: '2022-04-01T00:00:00.000Z',
      draft: true,
    }
    expect(actual).toEqual(expected)
  })

  test('"draft" should be false if omitted', () => {
    const md = dedent`
      ---
      title: TITLE
      summary: SUMMARY
      publishedAt: '2022-04-01'
      ---
      Hello
    `
    expect(extractMeta('ID', md, new Date('2022-04-01T00:00:00.000Z')).draft).toBe(false)
  })
})
