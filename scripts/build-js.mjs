// Turns each TypeScript component into a JavaScript (.jsx) copy, so the two never drift.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import ts from "typescript";
import * as prettier from "prettier";

const SRC = "items";
const OUT = "generated/js";

// Each item's component is items/<name>/<name>.tsx (skills and family pages have none).
for (const name of readdirSync(SRC)) {
  const dir = join(SRC, name);
  if (!existsSync(join(dir, `${name}.tsx`))) continue;
  for (const file of [`${name}.tsx`]) {
    const source = readFileSync(join(dir, file), "utf8");
    // Keep blank lines through the compiler.
    const marked = source.replace(/\n\s*\n/g, "\n/*__BLANK__*/\n");
    const { outputText } = ts.transpileModule(marked, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
        removeComments: false,
        verbatimModuleSyntax: false,
      },
    });
    const js = outputText.replace(/^\s*\/\*__BLANK__\*\/\s*$/gm, "");
    const ext = file.endsWith(".tsx") ? ".jsx" : ".js";
    const pretty = await prettier.format(js, { parser: "babel", printWidth: 100 });
    mkdirSync(join(OUT, name), { recursive: true });
    const target = join(OUT, name, basename(file).replace(/\.tsx?$/, ext));
    writeFileSync(target, pretty);
    console.log("js:", target);
  }
}
