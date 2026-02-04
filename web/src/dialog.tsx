import { type JSX, Show, splitProps } from "solid-js";
import * as app from "./app.tsx";

export default (
   props: {
      left?: JSX.Element;
      title: JSX.Element;
      right?: JSX.Element;
   } & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">,
) => {
   const [local, others] = splitProps(props, [
      "left",
      "title",
      "right",
      "class",
      "children",
   ]);
   return (
      <>
         <div
            class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
               app.tips() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
            } text-center`}
         >
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.left}>{local.left}</Show>
            </div>
            <div class="grow font-bold [app-region:drag]">
               {app.tips() || local.title}
            </div>
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.right}>{local.right}</Show>
            </div>
         </div>
         <div class={`body relative grow h-0 ${local.class ?? ""}`} {...others}>
            {local.children}
         </div>
      </>
   );
};
