export const id = "gemini.google.com";
export const matches = ["https://gemini.google.com/*"];
export const chatUrl = "https://gemini.google.com/";
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

  function newChat() {
    console.log("New chat");
    window.location.href = "https://gemini.google.com/";
  }

  function inputPrompt({ prompt }) {
    console.log("Input prompt", prompt);
    const promptElement = document.querySelector("[contenteditable]");
    if (promptElement) {
      promptElement.innerText = prompt;

      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      promptElement.dispatchEvent(event);
    } else {
      return alert("Prompt input not found.");
    }
  }

  function submitPrompt() {
    console.log("Submit prompt");
    const sendButton = document.querySelector(".send-button");
    if (sendButton) {
      sendButton.click();
    } else {
      alert("Prompt submit button not found");
    }
  }

  console.log("Mozart: Gemini Ready.");
}
