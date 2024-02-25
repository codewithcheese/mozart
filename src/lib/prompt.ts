import { waitForTabLoad } from "./tabs.ts";
import { sleep } from "../util/sleep.ts";

export async function submitPromptAllTabs(
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

export async function submitPrompt(
  tabId: number,
  data: Record<string, any>,
  newChat: boolean = true,
) {
  console.log("Submit prompt", tabId);
  if (newChat) {
    postMessageToUserScript(tabId, { type: "NEW_CHAT", ...data });
    await waitForTabLoad(tabId);
  }
  postMessageToUserScript(tabId, { type: "INPUT_PROMPT", ...data });
  await sleep(100);
  postMessageToUserScript(tabId, { type: "SUBMIT_PROMPT", ...data });
}

function postMessageToUserScript(tabId: number, message: Record<string, any>) {
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
