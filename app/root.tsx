import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "Looks like you've ventured into uncharted territory!"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[#13141a] bg-gradient-to-br from-[#181b22] to-[#2b3244] p-4">
      <div className="text-center">
        <h1 className="text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#11ffd6] to-[#6366f1] animate-pulse">
          {message}
        </h1>
        <p className="text-2xl text-[#ebeef5] mb-8 max-w-md mx-auto">{details}</p>
        {typeof error === "object" && error !== null && "status" in error && (error as any).status === 404 && (
          <div className="space-y-4 mb-8">
            <p className="text-[#bebec6]">Don't worry, let's get you back on track!</p>
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Link to='/' className="relative block">
                <button className="cursor-pointer px-8 py-4 bg-[#22282a] text-[#11ffd6] rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 hover:bg-[#2b3244] border border-[#11ffd6]">
                  Return to Home Page →
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      {stack && (
        <pre className="mt-8 p-4 bg-[#22282a] text-[#ebeef5] rounded-lg overflow-x-auto max-w-full border border-[#11ffd6]/20">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
