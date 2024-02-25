window.addEventListener("message", (event) => {
  if (event.source == window && event.data.type) {
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
  window.location.href = "https://chat.openai.com/?model=gpt-4";
}

function inputPrompt({ prompt }) {
  console.log("Input prompt", prompt);
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
    alert("Prompt input not found.");
  }
}

function submitPrompt() {
  console.log("Submit prompt");
  const sendButton = document.querySelector(
    'button[data-testid="send-button"]',
  );
  if (sendButton) {
    sendButton.click();
  } else {
    alert("Prompt submit button not found");
  }
}

console.log("ChatGPT Ready.");
