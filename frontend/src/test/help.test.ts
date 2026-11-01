import { helpUrl } from '@/lib/help'

describe('helpUrl', () => {
  it.each([
    ['/find', '/docs/guide/find'],
    ['/edit', '/docs/guide/dispense'],
    ['/add', '/docs/guide/add'],
    ['/manage/reports', '/docs/guide/reports'],
    ['/view', '/docs/guide/'],
    ['/', '/docs/guide/'],
  ])('maps %s to %s', (path, url) => {
    expect(helpUrl(path)).toBe(url)
  })
})
