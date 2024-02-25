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
  window.location.href = "https://www.phind.com/search?home=true";
}

function inputPrompt({ prompt }) {
  console.log("Input prompt", prompt);
  const promptInput = document.querySelector("textarea[name=q]");
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
  const sendButton = document.querySelector("button[type=submit]");
  if (sendButton) {
    sendButton.click();
  } else {
    alert("Prompt submit button not found");
  }
}

console.log("ChatGPT Ready.");
