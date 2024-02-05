import { PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon-light.svg" media="(prefers-color-scheme: light)"/>
        <link rel="icon" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)"/>
        <link rel="stylesheet" href="/styles.css" />
        <title>Dict</title>
      </head>
      <body class=" bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300">
        <Component />
      </body>
    </html>
  );
}
