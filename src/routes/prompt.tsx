import { useState } from "react";
import { submitPromptAllTabs } from "../lib/prompt.ts";
import { Link } from "react-router-dom";
import { CogIcon } from "../components/CogIcon.tsx";

export function Prompt() {
  const [prompt, setPrompt] = useState<string>("");

  return (
    <>
      <div>
        <Link to="/settings/sites">
          <CogIcon />
        </Link>
      </div>
      <div className="m-4">
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
              onClick={() => {
                submitPromptAllTabs({ prompt }, true);
              }}
            >
              New Chat (Ctrl+Enter)
            </button>
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              id="newMessageButton"
              onClick={() => {
                submitPromptAllTabs({ prompt }, false);
              }}
            >
              New Message (Shift+Enter)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
