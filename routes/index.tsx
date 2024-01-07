import Lookup from "../islands/Lookup.tsx";

export default function Home() {
  return (<div class="p-4 mx-auto max-w-screen-md">
    <img src="/dict.svg" class="w-32 h-32" />
    <Lookup />
  </div>);
}
