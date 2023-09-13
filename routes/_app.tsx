import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/dict.svg" />
        <title>Dict</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
