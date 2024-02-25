chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.create(
    { url: chrome.runtime.getURL("index.html") },
    function (tab) {
      // Tab opened.
    },
  );
});

function sendMessageToPageScript() {
  window.postMessage(
    { type: "FROM_EXTENSION", text: "Hello from extension!" },
    "*",
  );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Service worker received message", request, sender);
  chrome.tabs.query({}, function (tabs) {
    tabs.map((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: sendMessageToPageScript,
      });
    });
  });
});
