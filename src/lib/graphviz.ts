const DEFAULT_DOT = `digraph G {}`

const GLOBAL_OVERRIDE = `
  bgcolor="transparent";
  node [color="#999999", fontcolor="#999999", fontsize=11, width=0.1, height=0.1];
  edge [color="#999999", fontcolor="#999999"];
`

export async function renderDot(el: HTMLElement) {
  // @ts-ignore: no type definition
  const hpcc = await import('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js')
  hpcc.wasmFolder('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/')

  // inject GLOBAL_OVERRIDE and render
  const src = (el.textContent || DEFAULT_DOT).replace(/^(.+?{)/s, `$1 ${GLOBAL_OVERRIDE}`)
  const svg = await hpcc.graphviz.layout(src, 'svg', 'dot')

  // create a new element containing the rendered svg
  const newEl = document.createElement('div')
  newEl.classList.add('rendered-image')
  newEl.innerHTML = svg
  el.parentNode?.insertBefore(newEl, el)
}
