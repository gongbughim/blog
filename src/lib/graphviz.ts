const GLOBAL_OVERRIDES: Record<string, string> = {
  dot: `
    bgcolor="transparent";
    node [color="#888888", fontcolor="#888888", fontsize=11, width=0.1, height=0.1];
    edge [color="#888888", fontcolor="#888888"];
  `,
  category: `
    bgcolor="transparent";
    rankdir=LR;
    node [color="#888888", fontcolor="#888888", shape=none, width=0, height=0, margin=0.05, fontsize=14];
    edge [color="#888888", fontcolor="#888888", arrowsize=0.5, fontsize=11];
  `,
}

export async function renderDot(el: HTMLElement, lang: string) {
  // @ts-ignore: no type definition
  const hpcc = await import('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js')
  hpcc.wasmFolder('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/')

  // inject GLOBAL_OVERRIDE and render
  const raw = preprocess(el.textContent || '', lang)
  const src = raw.replace(/^(.+?{)/s, `$1 ${GLOBAL_OVERRIDES[lang] ?? ''}`)
  const svg = await hpcc.graphviz.layout(src, 'svg', 'dot')

  // create a new element containing the rendered svg
  const newEl = document.createElement('div')
  newEl.classList.add('rendered-image')
  newEl.innerHTML = svg
  el.parentNode?.insertBefore(newEl, el)
}

function preprocess(src: string, lang: string): string {
  if (lang === 'category') {
    return `digraph {${src}}`
  } else {
    return src
  }
}
