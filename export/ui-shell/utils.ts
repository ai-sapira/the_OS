type ClassValue = string | number | null | false | undefined | ClassDictionary | ClassArray
interface ClassDictionary {
  [id: string]: any
}
interface ClassArray extends Array<ClassValue> {}

function toVal(mix: ClassValue): string {
  let k: any
  let y: any
  let str = ''
  if (!mix) return str

  if (typeof mix === 'string' || typeof mix === 'number') {
    return '' + mix
  }

  if (Array.isArray(mix)) {
    for (k = 0; k < mix.length; k++) {
      if (mix[k]) {
        y = toVal(mix[k])
        if (y) str && (str += ' '), (str += y)
      }
    }
    return str
  }

  for (k in mix as ClassDictionary) {
    if ((mix as ClassDictionary)[k]) {
      str && (str += ' ')
      str += k
    }
  }
  return str
}

export function cn(...inputs: ClassValue[]) {
  // Lightweight clsx-like join without tailwind-merge
  const raw = inputs.map(toVal).filter(Boolean).join(' ')
  // naive dedupe while preserving order
  const seen = new Set<string>()
  return raw
    .split(/\s+/)
    .filter((c) => (c ? (seen.has(c) ? false : (seen.add(c), true)) : false))
    .join(' ')
}


