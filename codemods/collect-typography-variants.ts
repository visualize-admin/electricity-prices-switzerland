import * as fs from "fs";

import { parseSync } from "@babel/core";
import { glob } from "glob";
import jscodeshift from "jscodeshift";
import { mapValues } from "lodash";

// Function to find all ts/tsx files in the project
async function findTsFiles(rootDir: string = "./src"): Promise<string[]> {
  const g = glob(`${rootDir}/**/*.{ts,tsx}`, { ignore: "node_modules/**" });
  return await g;
}

type Variant = string;

const stats: Record<
  string,
  {
    count: number;
    files: Set<string>;
  }
> = {};
const record = (variant: Variant, path: string) => {
  stats[variant] = stats[variant] || {
    count: 0,
    files: new Set<string>(),
  };
  stats[variant].count++;
  stats[variant].files.add(path);
};

// Function to extract Typography variants from a file
function extractTypographyVariants(filePath: string): Set<string> {
  const variants = new Set<string>();

  try {
    // Read file content
    const source = fs.readFileSync(filePath, "utf8").toString();

    // Create jscodeshift root
    const root = jscodeshift(source, {
      parser: {
        parse: (source: string) =>
          parseSync(source, {
            plugins: [
              `@babel/plugin-syntax-jsx`,
              `@babel/plugin-proposal-class-properties`,
            ],
            overrides: [
              {
                test: [`**/*.ts`, `**/*.tsx`],
                plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
              },
            ],
            filename: "source-file.tsx", // this defines the loader depending on the extension
            parserOpts: {
              tokens: true, // recast uses this
            },
          }),
      },
    });

    // Find Typography elements
    root
      .find(jscodeshift.JSXElement)
      .filter((path) => {
        const elementName = path.node.openingElement.name;
        return (
          elementName &&
          elementName.type === "JSXIdentifier" &&
          elementName.name === "Typography"
        );
      })
      .forEach((path) => {
        // Look for variant prop
        const attributes = path.node.openingElement.attributes || [];
        for (const attr of attributes) {
          if (
            attr.type === "JSXAttribute" &&
            attr.name.name === "variant" &&
            attr.value
          ) {
            if (attr.value.type === "StringLiteral") {
              const variant = attr.value.value;
              record(variant, filePath);
            } else if (
              attr.value.type === "JSXExpressionContainer" &&
              attr.value.expression.type === "StringLiteral"
            ) {
              const variant = attr.value.expression.value;
              record(variant, filePath);
            }
          }
        }
      });
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }

  return variants;
}

async function main() {
  // Find all ts/tsx files
  const files = await findTsFiles();
  console.log(`Found ${files.length} TypeScript files`);

  // Collect all variant values
  const allVariants = new Set<string>();

  for (const file of files) {
    const fileVariants = extractTypographyVariants(file);
    fileVariants.forEach((variant) => allVariants.add(variant));

    if (fileVariants.size > 0) {
      console.log(`Found variants in ${file}:`, [...fileVariants]);
    }
  }

  console.log("\nAll Typography variants used in the project:");
  console.log(
    mapValues(stats, (value) => ({
      count: value.count,
      files: [...value.files],
    }))
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
