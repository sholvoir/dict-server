import Button from "@sholvoir/solid-components/button-ripple";
import TextInput from "@sholvoir/solid-components/input-text";
import List from "@sholvoir/solid-components/list";
import { createResource, createSignal, For, Show, type Signal } from "solid-js";
import type { IDict, IEntry } from "../../server/src/lib/idict.ts";
import { version } from "../package.json" with { type: "json" };
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";
import Ecard from "./ecard.tsx";
import * as srv from "./srv.ts";

export default () => {
   const [hide, setHide] = createSignal(false);
   const [auth, setAuth] = createSignal(false);
   const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());

   const [vocabularyView, setVocabularyView] = createSignal("");
   const handleLoadVocabularyClick = () =>
      setVocabularyView(Array.from(vocabulary()).sort().join("\n"));
   const handleAddToVocabularyClick = async () => {
      const res = await srv.postVocabulary(vocabularyView());
      if (res.ok) {
         const words = vocabularyView().split("\n");
         const vocab = app.vocabulary() as Set<string>;
         for (const word of words) vocab.add(word.trim());
         setVocabularyView("");
         app.showTips("上传成功");
         app.setVocabulary(vocab);
      } else app.showTips("上传失败");
   };
   const handleDeleteFromVocabularyClick = async () => {
      const res = await srv.deleteVocabulary(vocabularyView());
      if (res.ok) {
         const words = vocabularyView().split("\n");
         const vocab = app.vocabulary() as Set<string>;
         for (const word of words) vocab.delete(word);
         setVocabularyView("");
         app.showTips("删除成功");
         app.setVocabulary(vocab);
      } else app.showTips("删除失败");
   };

   const [word, setWord] = createSignal("");
   const [currentWord, setCurrentWord] = createSignal("_");
   const [currentCardIndex, setCurrentCardIndex] = createSignal(0);
   const [entries, setEntries] = createSignal<Array<Signal<IEntry>>>([]);
   const handleSearchClick = async () => {
      const w = encodeURIComponent(word());
      window.open(
         `https://www.merriam-webster.com/dictionary/${w}`,
         "merriam-webster",
      );
      window.open(
         `https://www.oxfordlearnersdictionaries.com/us/search/english/?q=${w}`,
         "oxfordlearnersdictionaries",
      );
      const dict = await srv.getDict(word());
      if (!dict) return app.showTips("Not Found");
      setCurrentWord(dict.word);
      setCurrentCardIndex(0);
      if (dict.entries)
         for (const entry of dict.entries)
            if (entry.meanings)
               for (const means of Object.values(entry.meanings))
                  if (means)
                     for (const mean of means)
                        if (entry.meanings.ecdict && mean.trans === undefined)
                           mean.trans = "";
      setEntries((dict.entries ?? []).map((e) => createSignal(e)));
      window.focus();
   };
   const handleAddCardClick = async () => {
      const dict = await srv.getDict(word());
      if (dict) {
         if (dict.entries?.[0].meanings)
            for (const means of Object.values(dict.entries?.[0].meanings))
               if (means) for (const m of means) if (!m.trans) m.trans = "";
         setEntries([...entries(), createSignal(dict.entries?.[0]!)]);
      }
   };
   const handleDeleteCardClick = () => {
      if (entries().length > 1)
         setEntries(entries().toSpliced(currentCardIndex(), 1));
      if (currentCardIndex() >= entries().length)
         setCurrentCardIndex(entries().length - 1);
   };
   const handleUpdateClick = async () => {
      const dict: IDict = {
         word: word(),
         entries: entries().map((e) => e[0]()),
      };
      app.showTips(
         (await srv.putDict(dict))
            ? `success update word "${word()}"!`
            : "Error",
      );
   };
   const handleDeleteClick = async () => {
      app.showTips(
         (await srv.deleteDict(word()))
            ? `success delete word "${word()}"!`
            : "Error",
      );
   };

   const [currentIssueIndex, setCurrentIssueIndex] = createSignal(0);
   const [issues, setIssues] = createSignal<
      Array<{ _id?: string; issue: string }>
   >([]);

   const handleECClick = async () => {
      const resp = await srv.getEcdict();
      if (resp.ok) {
         app.showTips("EC导入成功");
         await handleLoadIssueClick();
      } else app.showTips("EC导入失败");
   };

   const handleLoadIssueClick = async () => {
      const issues = await srv.getIssues();
      if (issues) {
         setIssues(issues);
         handleIssueClick();
      }
   };
   const handleIssueClick = () => {
      const issue = issues()[currentIssueIndex()];
      if (issue) {
         setWord(issue.issue);
         handleSearchClick();
      }
   };
   const handleProcessIssueClick = async () => {
      const issue = issues()[currentIssueIndex()];
      if (!issue) return;
      const result = (await srv.deleteIssue(issue._id!)) as any;
      if (result.acknowledged && result.deletedCount > 0) {
         setIssues((issues) =>
            issues.filter((_, i) => i !== currentIssueIndex()),
         );
         if (issues().length && currentIssueIndex() >= issues().length)
            setCurrentIssueIndex(issues().length - 1);
         if (issues().length) handleIssueClick();
         else {
            setWord("");
            setCurrentWord("_");
            setEntries([]);
            setCurrentCardIndex(0);
            handleLoadIssueClick();
         }
         app.showTips("处理成功!");
      } else app.showTips("处理失败");
   };
   createResource(async () => {
      // if (setAuth("hua" === mem.user)) {
      //    const [vocab, updatedVocab] = await mem.getVocabulary();
      //    vocab.size && app.setVocabulary(vocab);
      //    updatedVocab().then((nvocab) => nvocab && app.setVocabulary(nvocab));
      //    await handleLoadIssueClick();
      // }
   });
   return (
      <Show when={auth()}>
         <Dialog
            left={version}
            title={<span class="font-mono">系统管理&nbsp;ˈθʒɔɑɜæəɪʌʊʃðˌ</span>}
            right={`${issues().length}`}
            class="flex flex-col gap-2 p-2"
         >
            <div class="h-4 grow-4 flex flex-col gap-2">
               <div class="grow flex gap-2">
                  <For each={entries()}>
                     {(entry, i) => (
                        <Ecard
                           class="grow"
                           word={word()}
                           entry={entry}
                           showTips={app.showTips}
                           onClick={() => setCurrentCardIndex(i())}
                        />
                     )}
                  </For>
               </div>
               <div class="flex justify-between gap-2">
                  <TextInput
                     name="word"
                     placeholder="word"
                     class="grow"
                     binding={[word, setWord]}
                     options={app.vocabulary()}
                     onChange={handleSearchClick}
                  />
                  <Button
                     class="button btn-normal"
                     disabled={!word()}
                     onClick={handleSearchClick}
                  >
                     Search
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleAddCardClick}
                  >
                     增卡
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={
                        word() !== currentWord() || entries().length <= 1
                     }
                     onClick={handleDeleteCardClick}
                  >
                     {`删卡${currentCardIndex()}`}
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleDeleteClick}
                  >
                     删除
                  </Button>
                  <Button
                     class="button btn-normal"
                     disabled={word() !== currentWord()}
                     onClick={handleUpdateClick}
                  >
                     更新
                  </Button>
                  <Button
                     class="button btn-normal"
                     onClick={() => setHide((h) => !h)}
                  >
                     <span
                        class={`text-[150%] align-bottom icon--mdi ${
                           hide()
                              ? "icon--mdi--chevron-up"
                              : "icon--mdi--chevron-down"
                        }`}
                     />
                  </Button>
               </div>
            </div>
            <Show when={!hide()}>
               <div class="flex gap-2 max-h-48">
                  <textarea
                     class="w-1 grow"
                     value={vocabularyView()}
                     onChange={(e) => setVocabularyView(e.currentTarget.value)}
                  />
                  <div class="flex flex-col gap-1">
                     <Button
                        class="button btn-normal"
                        onClick={handleLoadVocabularyClick}
                     >
                        加载
                     </Button>
                     <Button
                        class="button btn-normal"
                        onClick={handleAddToVocabularyClick}
                     >
                        上传
                     </Button>
                     <Button
                        class="button btn-normal"
                        onClick={handleDeleteFromVocabularyClick}
                     >
                        删除
                     </Button>
                  </div>
                  <div class="w-1 grow border overflow-y-auto [scrollbar-width:none]">
                     <List
                        class="px-2"
                        cindex={[currentIssueIndex, setCurrentIssueIndex]}
                        activeClass="bg-[var(--bg-title)]"
                        options={issues()}
                        func={(issue) => issue.issue}
                        onClick={handleIssueClick}
                     />
                  </div>
                  <div class="flex flex-col gap-1">
                     <Button
                        class="button btn-normal"
                        onClick={handleProcessIssueClick}
                     >
                        处理问题
                     </Button>
                     <Button
                        class="button btn-normal"
                        onClick={handleLoadIssueClick}
                     >
                        加载问题
                     </Button>
                     <Button class="button btn-normal" onClick={handleECClick}>
                        EC
                     </Button>
                  </div>
               </div>
            </Show>
         </Dialog>
      </Show>
   );
};
