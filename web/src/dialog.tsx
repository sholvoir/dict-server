import { type Accessor, type JSX, Show, splitProps } from "solid-js";

export default (
   props: {
      left?: JSX.Element;
      title: JSX.Element;
      right?: JSX.Element;
      tips: Accessor<string>;
   } & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">,
) => {
   const [local, others] = splitProps(props, [
      "left",
      "title",
      "right",
      "class",
      "children",
      "tips",
   ]);
   return (
      <>
         <div
            class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
               local.tips() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
            } text-center`}
         >
            <div class="min-w-7 [app-region:no-drag]">
               <Show when={local.left}>{local.left}</Show>
            </div>
            <div class="grow font-bold [app-region:drag]">
               {local.tips() || local.title}
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
