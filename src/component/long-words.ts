/**
 * Lets a label wrap between words instead of being cut short with an ellipsis.
 *
 * A Georgian or Russian label is often half again as long as the English it was written from, and a Georgian word cut
 * short reads as a different word. Breaks fall between words; a single word wider than its line is hyphenated where
 * the browser knows the language, and broken only as a last resort, rather than spilling out of its box.
 */
export const LONG_WORDS = '[overflow-wrap:break-word] hyphens-auto';
