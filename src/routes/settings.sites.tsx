import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useState } from "react";
import { submitPrompt } from "../lib/prompt.ts";
import { createUserScript, loadSites, Site } from "../lib/site.ts";

function testScript(url: string) {
  chrome.tabs.create({ url }, function (newTab) {
    // Wait for the new tab to finish loading
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      // Check if the updated tab is the one we created and if it has finished loading
      if (tabId === newTab.id && changeInfo.status === "complete") {
        // Remove the listener to avoid memory leaks
        console.log("Test tab ready", tabId);
        chrome.tabs.onUpdated.removeListener(listener);
        submitPrompt(tabId, { prompt: "Hello world" });
      }
    });
  });
}

export function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  useEffect(() => {
    (async () => {
      const sites = await loadSites();
      setSites(sites);
    })();
  }, []);

  useEffect(() => {
    if (sites.length) {
      chrome.storage.sync.set({ sites });
      // @ts-expect-error no typings for userScripts API
      chrome.userScripts.update(sites.map(createUserScript));
    }
  }, [sites]);

  function addSite(site: Site) {
    // @ts-expect-error no typings for userScripts API
    chrome.userScripts.register([createUserScript(site)]);
    setSites((sites) => [...sites, site]);
  }

  function updateSite(index: number, site: Partial<Site>) {
    setSites((sites) => {
      return sites.toSpliced(index, 1, {
        id: sites[index].id,
        matches: site.matches || sites[index].matches,
        code: site.code || sites[index].code,
        chatUrl: site.chatUrl || sites[index].chatUrl,
      });
    });
  }

  return (
    <div className="m-4">
      <div className="text-3xl m-4">Sites</div>
      <div className="flex flex-row gap-2">
        <button
          onClick={() =>
            addSite({
              id: crypto.randomUUID(),
              matches: ["https://*/*"],
              code: "",
              chatUrl: "",
            })
          }
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Add site
        </button>
        <button
          onClick={() =>
            chrome.runtime.sendMessage({
              text: "Hello world",
              startNewChat: true,
            })
          }
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Send message
        </button>
      </div>
      {sites.map((site, index) => {
        return (
          <div key={index} className="max-w-[160ch] mb-4">
            <div>
              <input
                className="w-full"
                placeholder="ID"
                type="text"
                value={site.id}
                onChange={(event) =>
                  updateSite(index, { id: event.target.value })
                }
              />
            </div>
            <div>
              <input
                className="w-full"
                placeholder="Hostname"
                type="text"
                value={site.matches}
                onChange={(event) =>
                  updateSite(index, { matches: [event.target.value] })
                }
              />
            </div>
            <div>
              <CodeMirror
                className="text-base"
                value={site.code}
                height="500px"
                extensions={[javascript({ jsx: false })]}
                onChange={(val) => updateSite(index, { code: val })}
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                className="w-full"
                placeholder="Chat URL"
                type="text"
                value={site.chatUrl}
                onChange={(event) =>
                  updateSite(index, { chatUrl: event.target.value })
                }
              />
              <button
                onClick={() => testScript(site.chatUrl)}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Test
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
