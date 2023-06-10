import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useOutletContext,
} from "@remix-run/react";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { createContext } from "react";
import reactCircularProgress from "react-circular-progressbar/dist/styles.css";

export const links: LinksFunction = () => ([
  // { rel: "stylesheet", href: cssBundleHref },
  { rel: "stylesheet", href: bootstrap },
  { rel: "stylesheet", href: reactCircularProgress },
]);

const defaultChoreContext: { choreComplete: boolean; choreColor?: string} = {
  choreComplete: false,
  choreColor: undefined
};

const choreContext = createContext(defaultChoreContext);


export function useChoreContext() {
  return useOutletContext<typeof defaultChoreContext>();
}
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={choreContext} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
