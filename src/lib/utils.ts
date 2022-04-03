import { render } from '@testing-library/svelte'
import type { SvelteComponent } from 'svelte'

export const getQueryAPI = (c: typeof SvelteComponent) => {
  const doc = render(c).container.ownerDocument
  return (selector: string) => doc.querySelector(selector)
}
