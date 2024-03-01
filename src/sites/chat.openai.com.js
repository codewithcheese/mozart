export const id = "chat.openai.com";
export const matches = ["https://chat.openai.com/*"];
export const chatUrl = "https://chat.openai.com/";
export function script() {
  window.addEventListener("message", (event) => {
    if (event.source === window && event.data.type) {
      switch (event.data.type) {
        case "NEW_CHAT":
          return newChat();
        case "INPUT_PROMPT":
          return inputPrompt(event.data);
        case "SUBMIT_PROMPT":
          return submitPrompt(event.data);
      }
    }
  });

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function newChat() {
    console.log("Mozart: New chat");
    if (
      document.querySelector("button") &&
      document.querySelector("button").innerText.includes("sidebar")
    ) {
      console.log("Mozart: Clicking small screen new chat button");
      document.querySelectorAll("button")[1].click();
      await sleep(500);
    } else {
      console.log("Mozart: Navigating");
      window.location.href = "https://chat.openai.com/?model=gpt-4";
    }
  }

  function inputPrompt({ prompt }) {
    console.log("Mozart: Input prompt", prompt);
    const promptInput = document.querySelector("textarea#prompt-textarea");
    if (
      promptInput &&
      (promptInput.tagName === "INPUT" || promptInput.tagName === "TEXTAREA")
    ) {
      promptInput.value = prompt;
      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      promptInput.dispatchEvent(event); // Dispatch the event to the input
    } else {
      alert("Mozart: Prompt input not found.");
    }
  }

  function submitPrompt() {
    console.log("Mozart: Submit prompt");
    const sendButton = document.querySelector(
      'button[data-testid="send-button"]',
    );
    if (sendButton) {
      sendButton.click();
    } else {
      alert("Mozart: Prompt submit button not found");
    }
  }

  console.log("Mozart: ChatGPT Ready.");
}
