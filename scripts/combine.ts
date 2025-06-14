import { parse } from "jsr:@std/yaml";

interface Stack {
  name: string;
  base: string;
  packages: string[];
  pkgmanager: string;
  builtin: boolean;
}

interface PkgManager {
  name: string;
  model: number;
  needsudo: boolean;
  cmdautoremove: string;
  cmdclean: string;
  cmdinstall: string;
  cmdlist: string;
  cmdpurge: string;
  cmdremove: string;
  cmdsearch: string;
  cmdshow: string;
  cmdupdate: string;
  cmdupgrade: string;
  builtin: boolean;
}

async function parseYamlFile(filePath: string): Promise<unknown> {
  const fileContent = await Deno.readTextFile(filePath);
  return parse(fileContent);
}

async function collectData<T, D>(
  dir: string,
  transform: (data: D) => T,
  recursive = false,
): Promise<T[]> {
  const items: T[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      const entryPath = `${dir}/${entry.name}`;
      if (entry.isDirectory && recursive) {
        const subItems = await collectData<T, D>(
          entryPath,
          transform,
          recursive,
        );
        items.push(...subItems);
      } else if (
        entry.isFile &&
        (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))
      ) {
        try {
          const data = await parseYamlFile(entryPath) as D;
          items.push(transform(data));
        } catch {
          console.error(`Failed to parse YAML file: ${entryPath}`);
        }
      }
    }
  } catch {
    console.error(`Failed to read directory: ${dir}`);
  }

  return items;
}

function collectStacks(stacksDir: string): Promise<Stack[]> {
  return collectData<Stack, Stack>(
    stacksDir,
    (data) => ({
      name: data.name,
      base: data.base,
      packages: data.packages,
      pkgmanager: data.pkgmanager,
      builtin: data.builtin,
    }),
    true,
  );
}

function collectPkgManagers(pkgManagersDir: string): Promise<PkgManager[]> {
  return collectData<PkgManager, PkgManager>(
    pkgManagersDir,
    (data) => ({
      name: data.name,
      model: data.model,
      needsudo: data.needsudo,
      cmdautoremove: data.cmdautoremove,
      cmdclean: data.cmdclean,
      cmdinstall: data.cmdinstall,
      cmdlist: data.cmdlist,
      cmdpurge: data.cmdpurge,
      cmdremove: data.cmdremove,
      cmdsearch: data.cmdsearch,
      cmdshow: data.cmdshow,
      cmdupdate: data.cmdupdate,
      cmdupgrade: data.cmdupgrade,
      builtin: data.builtin,
    }),
    false,
  );
}

async function writeToJson(
  stacks: Stack[],
  pkgManagers: PkgManager[],
  outputPath: string,
) {
  const data = {
    stacks,
    pkgManagers,
  };

  const jsonString = JSON.stringify(data, null, 2) + "\n";
  await Deno.writeTextFile(outputPath, jsonString);
}

async function main() {
  const stacksDir = "./stacks";
  const pkgManagersDir = "./pkgmanagers";
  const outputPath = "./_index.json";

  const stacks = await collectStacks(stacksDir);
  const pkgManagers = await collectPkgManagers(pkgManagersDir);

  await writeToJson(stacks, pkgManagers, outputPath);

  console.log(`Collected data saved to ${outputPath}`);
}

main().catch((error) => console.error("Error: ", error));
