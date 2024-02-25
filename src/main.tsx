import "@fontsource-variable/inter";
import ReactDOM from "react-dom/client";
import { Root } from "./routes/root.tsx";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Prompt } from "./routes/prompt.tsx";
import { Sites } from "./routes/settings.sites.tsx";
import { Settings } from "./routes/settings.tsx";
import { insertDefaultSites } from "./lib/site.ts";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    loader: async () => {
      let { sites } = await chrome.storage.sync.get("sites");
      if (!sites) {
        await insertDefaultSites();
      }
      return null;
    },
    children: [
      {
        index: true,
        element: <Prompt />,
      },
      {
        path: "settings",
        element: <Settings />,
        children: [{ path: "sites", element: <Sites /> }],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
