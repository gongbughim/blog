import fs from 'fs'
import yaml from 'js-yaml'

export type ArticleMeta = {
  id: string
  title: string
  publishedAt: string
  summary: string
  draft: boolean
}

export async function getArticleMetas(dir: string): Promise<ArticleMeta[]> {
  const promises = (await fs.promises.readdir(dir))
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .map(id => getArticleMeta(dir, id))
  return (await Promise.all(promises)).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export async function getArticleMeta(dir: string, id: string): Promise<ArticleMeta> {
  const content = (await fs.promises.readFile(`${dir}/${id}.md`)).toString()
  const frag = content.substring(4, content.indexOf('---\n', 4)).trim()
  const frontmatter = yaml.load(frag) as Record<string, any>
  return { ...frontmatter, id, draft: !!frontmatter.draft } as ArticleMeta
}
