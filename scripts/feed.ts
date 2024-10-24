import { Atom } from "jsr:@feed/feed";
import { dirname, join } from "jsr:@std/path";

interface Stack {
  name: string;
  base: string;
  packages: string[];
  pkgmanager: string;
  builtin: boolean;
}

interface pkgManager {
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

interface UpdateData {
  stacks?: Stack[];
  pkgManagers?: pkgManager[];
}

const __dirname = dirname(new URL(import.meta.url).pathname);

const data: UpdateData = JSON.parse(
  await Deno.readTextFile(join(__dirname, "../_index.json")),
);

const feed = new Atom({
  title: "Apx Community",
  description:
    "Live feed of new stacks and package managers from the Apx Community.",
  id: "https://apx.vanillaos.org/",
  link: "https://apx.vanillaos.org/",
  language: "en",
  updated: new Date(),
  feedLinks: {
    atom: "https://apx-community.vanillaos.org/feed.xml",
  },
  authors: [
    {
      name: "Vanilla OS Contributors",
      email: "info@vanillaos.org",
      link: "https://vanillaos.org/",
    },
  ],
  copyright: "Copyright (c) Vanilla OS Contributors",
});

const stacks: Stack[] = data.stacks || [];
const pkgManagers: pkgManager[] = data.pkgManagers || [];

stacks.forEach((stack: Stack) => {
  feed.addItem({
    title: `New Stack: ${stack.name}`,
    id: stack.name,
    link: "https://apx.vanillaos.org/community",
    summary: "New stack published.",
    updated: new Date(),
    content: {
      type: "html",
      body: `<ul>
               <li>Base: ${stack.base}</li>
               <li>Packages: ${stack.packages.join(", ")}</li>
               <li>Package Manager: ${stack.pkgmanager}</li>
               <li>Builtin: ${stack.builtin ? "Yes" : "No"}</li>
             </ul>`,
    },
  });
});

pkgManagers.forEach((pkgManager: pkgManager) => {
  feed.addItem({
    title: `New Package Manager: ${pkgManager.name}`,
    id: pkgManager.name,
    link: "https://apx.vanillaos.org/community",
    summary: "New package manager published.",
    updated: new Date(),
    content: {
      type: "html",
      body: `<ul>
               <li>Model: ${pkgManager.model}</li>
               <li>Needs Sudo: ${pkgManager.needsudo ? "Yes" : "No"}</li>
               <li>Command Autoremove: ${pkgManager.cmdautoremove}</li>
               <li>Command Clean: ${pkgManager.cmdclean}</li>
               <li>Command Install: ${pkgManager.cmdinstall}</li>
               <li>Command List: ${pkgManager.cmdlist}</li>
               <li>Command Purge: ${pkgManager.cmdpurge}</li>
               <li>Command Remove: ${pkgManager.cmdremove}</li>
               <li>Command Search: ${pkgManager.cmdsearch}</li>
               <li>Command Show: ${pkgManager.cmdshow}</li>
               <li>Command Update: ${pkgManager.cmdupdate}</li>
               <li>Command Upgrade: ${pkgManager.cmdupgrade}</li>
               <li>Builtin: ${pkgManager.builtin ? "Yes" : "No"}</li>
             </ul>`,
    },
  });
});

await Deno.writeTextFile(join(__dirname, "../feed.xml"), feed.build());

console.log("Atom feed generated.");
