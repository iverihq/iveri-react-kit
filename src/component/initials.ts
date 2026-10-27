/**
 * The first letter of the first and **last** words, so "Ana Maria Beridze" reads `AB` rather
 * than `AM` — a middle name is not what anybody identifies somebody by. A one-word name gives a
 * single letter rather than two from the same word.
 *
 * ⚠ **Upper-casing Georgian changes script block.** Mkhedruli (`U+10A0–10FF`) upper-cases to
 * Mtavruli (`U+1C90–1CBF`), so `ანა` yields `Ა` — a codepoint in a different range from every
 * other Georgian glyph on the screen. `Noto Sans Georgian` covers both, which is the only
 * reason this renders; a Georgian font covering only Mkhedruli would show tofu here while every
 * other Georgian string on the page looked fine.
 *
 * In its own module rather than beside `Avatar`, so a spec can import the rule without
 * rendering a component — and so the component file exports only a component.
 */
export function initialsOf(name: string): string {
    const words = name.split(/\s+/u).filter((part) => part.length > 0);
    const chosen = words.length > 1 ? [words[0], words[words.length - 1]] : words;

    return chosen.map((part) => [...part][0]?.toLocaleUpperCase() ?? '').join('');
}
