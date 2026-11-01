const guidePages: Record<string, string> = {
  '/find': 'find',
  '/edit': 'dispense',
  '/add': 'add',
  '/manage/reports': 'reports',
}

export function helpUrl(path: string): string {
  return `/docs/guide/${guidePages[path] ?? ''}`
}
