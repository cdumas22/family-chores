import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction, type LoaderArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { createContext } from "react";
import reactCircularProgress from "react-circular-progressbar/dist/styles.css";
import SSRProvider from "react-bootstrap/SSRProvider";
import { getUserId } from "./utils/session.server";
import { Stack } from "react-bootstrap";
import { Sidebar } from "./components/Sidebar";
import prisma from "./lib/db.server";
import { type Group } from "@prisma/client";

export const links: LinksFunction = () => [
  // { rel: "stylesheet", href: cssBundleHref },
  { rel: "stylesheet", href: bootstrap },
  { rel: "stylesheet", href: reactCircularProgress },
];

const defaultChoreContext: { choreComplete: boolean; choreColor?: string } = {
  choreComplete: false,
  choreColor: undefined,
};

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);

  let groups = [] as Group[];
  if (userId != null) {
    groups = (await prisma.group.findMany({ where: { userId } })) as Group[];
  }
  return json({ authenticated: userId != null, groups });
}

const choreContext = createContext(defaultChoreContext);

export function useChoreContext() {
  return useOutletContext<typeof defaultChoreContext>();
}
export default function App() {
  const { authenticated, groups } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <SSRProvider>
          <Stack>
            <Sidebar authenticated={authenticated} groups={groups} />
            <Outlet context={choreContext} />
          </Stack>
        </SSRProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
