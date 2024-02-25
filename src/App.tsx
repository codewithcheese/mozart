import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import _ from "lodash";

type Script = {
  id: string;
  matches: string[];
  js: {
    code: string;
  }[];
  testUrl: string;
};

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let tabsState: Record<number, { status: string }> = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log("Tab onUpdated", tabId, changeInfo);

  // Initialize the state for the tab if it doesn't exist
  if (!tabsState[tabId]) {
    tabsState[tabId] = { status: "unknown" };
  }

  if (changeInfo.status === "loading") {
    console.log("Tab is loading:", tabId);
    // Update the state of the tab to loading
    tabsState[tabId].status = "loading";
    // You can perform your actions here when the tab starts loading
  } else if (changeInfo.status === "complete") {
    console.log("Tab has finished loading:", tabId);
    // Update the state of the tab to complete
    tabsState[tabId].status = "complete";
    // Actions to perform when the tab has finished loading
  }

  // Additional checks or actions based on the state of the tab can be performed here
});

function waitForTabLoad(tabId: number, timeout = 5000) {
  // timeout in milliseconds
  return new Promise((resolve, reject) => {
    const pollInterval = 100;

    const intervalId = setInterval(() => {
      chrome.tabs.get(tabId, (tab) => {
        if (tab.status === "complete") {
          clearInterval(intervalId);
          clearTimeout(timeoutId); // Clear the timeout
          resolve(true);
        }
      });
    }, pollInterval);

    // Timeout handling
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error("Tab loading timed out"));
    }, timeout);
  });
}

async function submitPromptAllTabs(
  data: Record<string, any>,
  newChat: boolean = true,
) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.id) {
        submitPrompt(tab.id, data, newChat);
      }
    });
  });
}

async function submitPrompt(
  tabId: number,
  data: Record<string, any>,
  newChat: boolean = true,
) {
  console.log("Submit prompt", tabId);
  if (newChat) {
    sendMessageToUserScript(tabId, { type: "NEW_CHAT", ...data });
    await waitForTabLoad(tabId);
  }
  sendMessageToUserScript(tabId, { type: "INPUT_PROMPT", ...data });
  await sleep(100);
  sendMessageToUserScript(tabId, { type: "SUBMIT_PROMPT", ...data });
}

function sendMessageToUserScript(tabId: number, message: Record<string, any>) {
  console.log("sendingMessage to userScript");
  chrome.scripting.executeScript({
    target: { tabId },
    // @ts-ignore
    function: function (message) {
      console.log("Posting message to tab");
      window.postMessage(message, "*");
    },
    args: [message],
  });
}

function App() {
  const [prompt, setPrompt] = useState<string>("");
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    chrome.storage.sync.get("scripts", ({ scripts }) => {
      console.log("loading scripts", scripts);
      if (scripts) {
        setScripts(scripts);
        // @ts-expect-error no typings for userScripts API
        chrome.userScripts.register(
          scripts.map((script: Script) => _.omit(script, "testUrl")),
        );
      }
    });
  }, []);

  useEffect(() => {
    if (scripts.length) {
      console.log("saving scripts", scripts);
      chrome.storage.sync.set({ scripts });

      // @ts-expect-error no typings for userScripts API
      chrome.userScripts.update(
        scripts.map((script: Script) => _.omit(script, "testUrl")),
      );
    }
  }, [scripts]);

  function addScript(script: Script) {
    // @ts-expect-error no typings for userScripts API
    chrome.userScripts.register([_.omit(script, "testUrl")]);
    setScripts((scripts) => [...scripts, script]);
  }

  function updateScript(index: number, script: Partial<Script>) {
    setScripts((scripts) => {
      return scripts.toSpliced(index, 1, {
        id: scripts[index].id,
        matches: script.matches || scripts[index].matches,
        js: script.js || scripts[index].js,
        testUrl: script.testUrl || scripts[index].testUrl,
      });
    });
  }

  return (
    <div className="m-2">
      <div className="text-3xl m-4">Submit prompt</div>
      <div className="max-w-[160ch]">
        <textarea
          id="textInput"
          placeholder="Enter prompt..."
          value={prompt}
          rows={6}
          style={{ width: "100%" }}
          onChange={(event) => {
            setPrompt(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // New Chat (Ctrl+Enter)
              if (event.ctrlKey) {
                submitPromptAllTabs(
                  { prompt: event.currentTarget.value },
                  true,
                );
              }
              // New Message (Shift+Enter)
              else if (event.shiftKey) {
                submitPromptAllTabs(
                  { prompt: event.currentTarget.value },
                  false,
                );
              }
            }
          }}
        ></textarea>
        <div className="flex flex-row">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            id="newChatButton"
            onClick={(event) => {
              submitPromptAllTabs({ prompt: event.currentTarget.value }, true);
            }}
          >
            New Chat (Ctrl+Enter)
          </button>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            id="newMessageButton"
            onClick={(event) => {
              submitPromptAllTabs({ prompt: event.currentTarget.value }, false);
            }}
          >
            New Message (Shift+Enter)
          </button>
        </div>
      </div>
      <div className="text-3xl m-4">Scripts</div>
      <div className="flex flex-row gap-2">
        <button
          onClick={() =>
            addScript({
              id: crypto.randomUUID(),
              matches: ["https://*/*"],
              js: [{ code: "" }],
              testUrl: "",
            })
          }
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Add script
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
      {scripts.map((script, index) => {
        return (
          <div key={index} className="max-w-[160ch] mb-4">
            <div>
              <input
                className="w-full"
                placeholder="Hostname"
                type="text"
                value={script.matches}
                onChange={(event) =>
                  updateScript(index, { matches: [event.target.value] })
                }
              />
            </div>
            <div>
              <CodeMirror
                className="text-base"
                value={script.js[0].code}
                height="500px"
                extensions={[javascript({ jsx: false })]}
                onChange={(val) => updateScript(index, { js: [{ code: val }] })}
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                className="w-full"
                placeholder="Test URL"
                type="text"
                value={script.testUrl}
                onChange={(event) =>
                  updateScript(index, { testUrl: event.target.value })
                }
              />
              <button
                onClick={() => testScript(script.testUrl)}
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

export default App;
