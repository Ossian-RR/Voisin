import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * French typography: a no-break space (U+00A0) goes before ? ! : ; and inside
 * « », so the sign never starts a line on its own on a narrow phone.
 * Checks every string literal of the app; text written directly in JSX is
 * not covered (see docs/05-testing.md).
 */
const BAD = /[^\s  ([{] (?=[?!:;](?:[\s"'`<{}]|$))|« | »/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) &&
      !/\.spec\.ts$|database\.types\.ts$/.test(entry.name)
      ? [path]
      : [];
  });
}

/** Contents of '…', "…" and `…` literals, comments skipped. */
function stringLiterals(src: string): string[] {
  const found: string[] = [];
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("//", i)) {
      const end = src.indexOf("\n", i);
      i = end < 0 ? src.length : end;
    } else if (src.startsWith("/*", i)) {
      i = src.indexOf("*/", i) + 2;
    } else if (`"'\``.includes(src[i])) {
      const quote = src[i];
      let j = i + 1;
      while (j < src.length && src[j] !== quote) {
        if (src[j] === "\\") j++;
        if (quote !== "`" && src[j] === "\n") break;
        j++;
      }
      found.push(src.slice(i + 1, j));
      i = j + 1;
    } else {
      i++;
    }
  }
  return found;
}

describe("French typography", () => {
  it("has a no-break space before ? ! : ; and inside « » in every string", () => {
    const offending = ["client", "shared"].flatMap((root) =>
      sourceFiles(root).flatMap((file) =>
        stringLiterals(readFileSync(file, "utf-8"))
          .filter((text) => text.match(BAD))
          .map((text) => `${file}: ${text}`),
      ),
    );
    expect(offending).toEqual([]);
  });

  it("would catch an ordinary space", () => {
    expect("Bon retour !".match(BAD)).not.toBeNull();
    expect("« Enregistrer »".match(BAD)).not.toBeNull();
    expect("Bon retour !".match(BAD)).toBeNull();
  });
});
