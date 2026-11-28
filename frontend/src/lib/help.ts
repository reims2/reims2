const guidePages: Record<string, string> = {
  '/find': 'find',
  '/edit': 'dispense',
  '/add': 'add',
  '/manage/reports': 'reports',
  '/manage/refill': 'reports#what-to-refill',
}

export function helpUrl(path: string): string {
  return `/docs/guide/${guidePages[path] ?? ''}`
}
