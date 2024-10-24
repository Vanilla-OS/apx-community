import { walk } from "jsr:@std/fs";
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

async function collectData<T>(
  dir: string,
  transform: (data: all) => T,
): Promise<T[]> {
  const items: T[] = [];

  for await (
    const entry of walk(dir, {
      exts: [".yaml", ".yml"],
      includeDirs: false,
    })
  ) {
    const data = await parseYamlFile(entry.path);
    items.push(transform(data));
  }

  return items;
}

function collectStacks(stacksDir: string): Promise<Stack[]> {
  return collectData(stacksDir, (data) => ({
    name: data.name,
    base: data.base,
    packages: data.packages,
    pkgmanager: data.pkgmanager,
    builtin: data.builtin,
  }));
}

function collectPkgManagers(pkgManagersDir: string): Promise<PkgManager[]> {
  return collectData(pkgManagersDir, (data) => ({
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
  }));
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
