// Arabic script blocks (base, supplement, extended-A, presentation forms A/B)
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/

export interface QuoteParts {
  arabic: string
  translation: string
}

/**
 * Splits a quote like "وَمِنْ اٰيٰتِهٖٓ ... Dan di antara tanda-tanda..." into the Arabic
 * verse and its translation, so the verse can sit on its own line above the translation.
 * Text without Arabic comes back untouched as the translation.
 */
export function splitArabicQuote(text: string | null | undefined): QuoteParts {
  const value = (text || '').trim()
  let first = -1
  let last = -1
  for (let i = 0; i < value.length; i++) {
    if (ARABIC.test(value[i])) {
      if (first === -1) first = i
      last = i
    }
  }
  if (first === -1) return { arabic: '', translation: value }

  const arabic = value.slice(first, last + 1).trim()
  const translation = `${value.slice(0, first)} ${value.slice(last + 1)}`
    .trim()
    // separators left behind between the verse and the translation
    .replace(/^[\s\-–—:;,.|"“”'‘’()]+/, '')
    .replace(/[\s\-–—:;,|"“”'‘’(]+$/, '')
    .trim()
  return { arabic, translation }
}
