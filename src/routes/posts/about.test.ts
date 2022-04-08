import { cleanup } from '@testing-library/svelte'
import { beforeEach, expect, test } from 'vitest'

import { getQueryAPI } from '$lib/utils'

// @ts-ignore: *.md is not supported by typescript
import About from './about.md'

beforeEach(cleanup)

test('Metadata rendering', () => {
  const $ = getQueryAPI(About)
  expect($('title')?.textContent).toBe('소개 :: 공부왕 김공부')
  expect($('meta[name="description"]')?.getAttribute('content')).toBe('블로그 소개')
  expect($('h1')?.textContent).toBe('소개')
})
