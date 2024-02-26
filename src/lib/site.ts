export type Site = {
  id: string;
  matches: string[];
  code: string;
  chatUrl: string;
};

export type SiteModule = {
  id: string;
  script: () => void;
  matches: string[];
  chatUrl: string;
};

export async function insertDefaultSites() {
  const openai = await import("../sites/chat.openai.com.js");
  const gemini = await import("../sites/gemini.google.com.js");
  const perplexity = await import("../sites/www.perplexity.ai.js");
  const phind = await import("../sites/www.phind.com.js");

  const scripts = [
    createUserScript(createSite(openai)),
    createUserScript(createSite(gemini)),
    createUserScript(createSite(perplexity)),
    createUserScript(createSite(phind)),
  ];

  chrome.storage.sync.set({
    sites: [
      createSite(openai),
      createSite(gemini),
      createSite(perplexity),
      createSite(phind),
    ],
  });

  for (const script of scripts) {
    try {
      // @ts-expect-error no typings for userScripts API
      chrome.userScripts.register([script]);
    } catch (e) {
      console.error(e);
    }
  }
}

export function createSite(module: SiteModule): Site {
  return {
    id: module.id,
    matches: module.matches,
    code: `
${module.script.toString()};
script();
`,
    chatUrl: module.chatUrl,
  };
}

export function createUserScript(site: Site) {
  return {
    id: site.id,
    matches: site.matches,
    js: [{ code: site.code }],
  };
}

export async function loadSites() {
  let { sites } = await chrome.storage.sync.get("sites");
  if (!sites) {
    await insertDefaultSites();
  }
  ({ sites } = await chrome.storage.sync.get("sites"));
  return sites;
}

export async function registerScripts() {
  console.log("Registering scripts...");
  // @ts-expect-error no types for userScripts
  let ids = (await chrome.userScripts.getScripts()).map((s) => s.id);
  console.log("Already registered:", ids);
  const { sites } = await chrome.storage.sync.get("sites");
  const scripts = sites
    .filter((site: Site) => !ids.includes(site.id))
    .map((site: Site) => createUserScript(site));
  // registering one-by-one and catching errors
  // due to unexpected duplicate script id
  // even though the id is not present in the original get scripts
  for (const script of scripts) {
    console.log("Registering:", script.id);
    try {
      // @ts-expect-error no types for userScripts
      await chrome.userScripts.register([script]);
    } catch (e) {
      console.error(e);
    }
  }
  // @ts-expect-error no types for userScripts
  ids = (await chrome.userScripts.getScripts()).map((s) => s.id);
  console.log("Registered:", ids);
}
