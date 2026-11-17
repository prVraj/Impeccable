/* ---------- Task progress ----------
 * Install: adds the exact list; asks only where it goes and which steps it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const TASK_ONE_LINE = `A task list where each task is not started (a dotted circle), in progress (an arc spinning over the dots) or done (a filled circle with a check). When a task finishes, its check draws in, its text fades and a strike line draws across it. Hovering a done task (tapping it on a phone) pulls the strike back and darkens the text so it can be read. Only the first 5 tasks show; the rest open under "Show N more" and close with "Show less".`;

const TASK_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/task-progress.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`task-progress.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/task-progress.tsx\`
- Keep these exports and their names: \`TaskProgress\`, \`TaskProgressProps\`, \`Task\`, \`TaskStatus\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`EASE\`, \`POP\`, \`SPIN_MS\`, \`ARC\`, \`STRIKE_MS\`, \`STRIKE_DELAY\`, \`PEEK_MS\`, \`OPEN_MS\`, \`STAGGER\`, \`R\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the arc stops spinning and every change is a short fade (the strike appears without drawing). The rows under "Show more" are \`inert\` while folded, so keyboards and screen readers skip them. Screen readers hear "Done", "In progress" or "Not started" before each task, and the task in progress has \`aria-current="step"\`.`;

const TASK_HOW = `## How the list works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The card.** A box with a 1px border at 13% of the text color and 16px corners, 15px text on 22px lines. Each task is one row: an 18px icon, a 12px gap, then the text, which wraps under itself (never under the icon). There is no background, so the page shows through unless \`style\` or \`className\` sets one.
2. **Not started.** A circle of 8 round dots at 52% of the text color. The text is the normal text color.
3. **In progress.** An arc covering 62% of the circle draws in over the dots and spins once every 0.9 seconds. It is the text color unless \`activeColor\` is set.
4. **Done.** The arc closes into a full ring, then a filled circle (46% of the text color) pops in with a tiny overshoot, and a check draws inside it. 0.3 seconds later the text fades to 46% and a 1.25px line draws across it from left to right in 0.52 seconds. On wrapped text the line runs across the first line, then the next. Tasks that are already done when the list first shows are struck at once, with no animation.
5. **Peek.** Hovering a done task pulls the line back to the left in 0.26 seconds and darkens the text to 88%; leaving draws it back. Phones have no hover, so a tap does the same and a second tap undoes it.
6. **Show more.** Only the first \`limit\` tasks (5) show. Under them, "Show N more" (the number of hidden tasks) opens the rest: the space grows in 0.42 seconds with a soft landing and the rows fade and slide down into place 45ms apart. The button then reads "Show less" and folds them away again. The list keeps its order; tasks are never moved.
7. **Colors.** Everything is mixed from the text color around the list, so it follows light and dark mode. The check is white on light pages and near-black on dark pages; it is re-read when the theme changes.`;

export function installPrompt(tsSource: string) {
  return `# Task progress

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${TASK_ONE_LINE}

## Before you build: one question

Look through this project first: any screen that runs several steps in a row (an AI agent or assistant run, onboarding or setup, an import, build or deploy), any checklist or stepper it already has, and where those steps' states live in the code. Then ask me this in one message and wait for my answer:

- **Where should it go, and which steps does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the steps you would list and the existing state you would read to mark each one not started, in progress or done. I can pick one or name another.
  *Why: the list is only honest when its states come from real work, so it belongs where my product already knows which step it is on.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The three icons (dotted circle, spinning arc, filled circle with a check), the strike that draws across a finished task, the peek on hover or tap, and the fold after 5 tasks with "Show N more" and "Show less", with their timing, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing checklist or stepper there, keep that spot's logic and remove only the old list. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the list that plays on its own and starts over (\`useTaskRun\`), its example task names, pausing while the pointer is on it, the dotted card behind it, and the home page's TV.

${TASK_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { TaskProgress, type Task } from "@/components/ui/task-progress";

export function SetupSteps({ step }: { step: number }) {
  const names = ["Connect your store", "Import products", "Pick a theme", "Add a payment method", "Invite your team", "Go live"];
  const tasks: Task[] = names.map((label, i) => ({
    id: label,
    label,
    status: i < step ? "done" : i === step ? "active" : "pending",
  }));
  return <TaskProgress tasks={tasks} aria-label="Setup steps" className="max-w-md" />;
}
\`\`\`

- Give each task a stable \`id\` (its name or the step's id), so a task keeps its own animation when the list changes.
- Change a task's \`status\` to animate it. Don't remount the list to update it, or nothing animates.
- It takes its text color from its parent, so place it where my normal text color applies. It fills the width it is given, so set a max width with \`className\` or \`style\`.

${TASK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The task in progress spins. When it finishes, its check draws in and, about 0.3 seconds later, a line draws across its text from left to right while the text fades. Hovering a done task pulls the line back and darkens the text. With more than 5 tasks, "Show N more" opens the rest and "Show less" folds them away.
- It looks right in light and dark mode (check both): the check is readable inside the filled circle in each.
- It works with a finger on a phone: tapping a done task shows it clearly, tapping again strikes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the arc stands still and every change is a short fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/task-progress.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Task progress, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${TASK_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: screens that run several steps in a row (an AI agent run, onboarding or setup, an import, build or deploy), any checklist or stepper it already has and where its states live, the way it writes short UI text, its theme colors and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which steps does it show?** Suggest the 1–3 spots it fits best, naming the steps you would list and the state you would read for each.
      *Why: the list is only honest when its states come from real work, so it belongs where my product already knows which step it is on.*
   2. **How many show before it folds?** 5 (suggested), 3 for a small side panel, or all of them for 6 or fewer steps.
      *Why: the fold keeps a long run calm to look at; a short list doesn't need one.*
   3. **The words?** Keep "Show N more" and "Show less" (suggested), or the same in my product's voice and language. Same for the line shown when there are no tasks.
      *Why: these are the only words the list adds to my screen, so they should sound like the rest of my product.*
   4. **The spinner's color?** Keep my text color (suggested, it stays calm and monochrome), or name which of my existing color variables you'd use for the arc on the task in progress, like my brand or accent color.
      *Why: the arc is the only thing that moves on the list, so a brand color makes the current step stand out; text color keeps it quiet.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and steps, how many show, the words, the spinner color, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and steps: where the component is rendered, and \`tasks\` (labels, ids and each status from my existing state).
- How many show: \`limit\`, or \`defaultExpanded\` to start open.
- The words: \`moreLabel\`, \`lessLabel\`, \`emptyLabel\` and \`aria-label\`.
- The spinner's color: \`activeColor\`, as my theme's CSS variable.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The three icons (dotted circle, spinning arc, filled circle with a check), the strike that draws across a finished task, the peek on hover or tap, and the fold with "Show more", with their sizes and timing, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the list that plays on its own and starts over, its example task names, pausing while the pointer is on it, the dotted card and the home page's TV).

${TASK_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { TaskProgress, type Task } from "@/components/ui/task-progress";

// From my brief. Leave out any prop that stays at its default.
export function AgentSteps({ steps }: { steps: { id: string; title: string; state: "queued" | "running" | "finished" }[] }) {
  const tasks: Task[] = steps.map((s) => ({
    id: s.id,
    label: s.title,
    status: s.state === "finished" ? "done" : s.state === "running" ? "active" : "pending",
  }));
  return (
    <TaskProgress
      tasks={tasks}
      limit={5}
      activeColor="var(--primary)" // my theme's variable, not hex
      moreLabel={(n) => \`\${n} more steps\`}
      lessLabel="Fewer steps"
      aria-label="Agent steps"
      className="max-w-md"
    />
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Keep every status coming from my real state. Give each task a stable \`id\`, and change \`status\` to animate it; don't remount the list.
- It takes its text color from its parent, so place it where my normal text color applies. It fills the width it is given; set a max width with \`className\` or \`style\`.

${TASK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My steps show with my words, and their states follow my real state. The task in progress spins in my chosen color. When it finishes, its check draws in and, about 0.3 seconds later, a line draws across its text while the text fades. Hovering a done task pulls the line back. With more tasks than my limit, my "show more" words open the rest and my "show less" words fold them away.
- It looks right in light and dark mode (check both), with the spinner color and the check readable in each.
- It works with a finger on a phone: tapping a done task shows it clearly, tapping again strikes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the arc stands still and every change is a short fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/task-progress.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
