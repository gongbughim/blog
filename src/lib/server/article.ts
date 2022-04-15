import fs from 'fs/promises'
import yaml from 'js-yaml'

/** Meatadata of article */
export type ArticleMeta = {
  /** Article ID */
  id: string
  /** Title */
  title: string
  /** Published date as YYYY-MM-DD form */
  publishedAt: string
  /** Modified datetime as ISO format */
  modifiedAt: string
  /** Short summary in plain text */
  summary: string
  /** Draft flag */
  draft: boolean
}

/**
 * Extract metadata of all articles with the directory
 * @param dir A path
 * @returns Metadata of all articles
 */
export async function getArticleMetas(dir: string): Promise<ArticleMeta[]> {
  const promises = (await fs.readdir(dir))
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .map(id => getArticleMeta(dir, id))
  return (await Promise.all(promises)).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

/**
 * Extract metadata from directory and article id
 * @param dir A path
 * @param id Article ID
 * @returns Metadata of article
 */
export async function getArticleMeta(dir: string, id: string): Promise<ArticleMeta> {
  const filepath = `${dir}/${id}.md`
  const f = await fs.readFile(filepath)
  const mtime = (await fs.stat(filepath)).mtime

  return extractMeta(id, f.toString(), mtime)
}

/**
 * Extract metadata from markdown file.
 * @param id Article ID
 * @param markdown Raw markdown content
 * @returns Metadata of article
 */
export function extractMeta(id: string, markdown: string, mtime: Date): ArticleMeta {
  const S = '---\n' // separator
  const raw = markdown.substring(S.length, markdown.indexOf(S, S.length)).trim()
  const frontmatter = yaml.load(raw) as Record<string, any>
  return {
    ...frontmatter,
    id,
    draft: !!frontmatter.draft,
    modifiedAt: mtime.toISOString(),
  } as ArticleMeta
}
