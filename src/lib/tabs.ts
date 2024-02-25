const tabsState: Record<number, { status: string }> = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (!tabsState[tabId]) {
    tabsState[tabId] = { status: "unknown" };
  }
  if (changeInfo.status === "loading") {
    tabsState[tabId].status = "loading";
  } else if (changeInfo.status === "complete") {
    tabsState[tabId].status = "complete";
  }
});

export function waitForTabLoad(tabId: number, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const pollInterval = 100;

    const intervalId = setInterval(() => {
      chrome.tabs.get(tabId, (tab) => {
        if (tab.status === "complete") {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          resolve(true);
        }
      });
    }, pollInterval);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error("Tab loading timed out"));
    }, timeoutMs);
  });
}
