# Interview

16 questions in 4 rounds. **Quick** mode (default) asks the 14 marked (Q). **Deep** mode asks all 16. In Quick mode, the two Deep questions are inferred from the references and shown in the round checklist, where rule 2 (nothing accepted silently) applies to them.

Each question carries its **why**. The why is for you, not the person: it tells you what the answer must decide. If an answer doesn't settle what the why needs, ask one follow-up. Never more than one per question (in Q3, one per site).

Never ask in CSS terms. Offer named, visible examples ("like Linear", "like Stripe") and translate the answer into values yourself, using the value tables in writing-the-skill.md.

## Round 1: You and your references

Send Q1, Q2 and Q4 together. Study the sites (reading-references.md). Then send Q3, one site at a time.

**Q1 (Q). What do you mostly build, and for whom?** (e.g. "landing pages for dev tools", "dashboards for clinics")
Why: a dashboard and a landing page need different density, motion and ambition. Every default after this depends on it.

**Q2 (Q). Share 3 to 5 sites or apps you love.** Links or screenshots both work.
Why: people recognise taste far better than they describe it. Every later recommendation comes from these. Study them before Q3 (reading-references.md).

If they have none to hand, offer a menu and let them pick 3: Linear, Stripe, Vercel, Apple, Raycast, Notion, Arc, Framer, a magazine site such as The Verge, or a portfolio they admire. Picked sites are drilled in Q3 like their own.

**Q3 (Q). For each one: what exactly grabbed you?** Ask per site, using the bucket list below, for the 3 sites they care about most. "Same as the last one" is a fine answer. This counts as one question however many sites there are.
Why: liking a site isn't liking everything on it. This separates the parts to copy from the parts to ignore.

**Q4 (Q). Share 1 or 2 sites or looks you're tired of, and list anything you never want to see.** (e.g. purple gradients, everything centred, emoji icons)
Why: dislikes are sharper than likes, and this becomes the never list the skill checks every build against.

### The bucket list (for Q3)

Show it as a numbered list and let them pick several:

1. Components (nav, buttons, cards, inputs, pricing tables...)
2. Sections and layout (how the page is put together)
3. Animation (things that move on their own)
4. Transitions (how things change state, open, close, move between pages)
5. Subtle gradients
6. Shadows and depth
7. Gaps and padding (the spacing)
8. Typography
9. Colours
10. Easing and feel (how motion speeds up and slows down)
11. Icons
12. Effects (blur, grain, glow, masks...)
13. Something else: tell me

If a pick is too broad to build from, ask one specific follow-up for that site: "Which component: the nav or the pricing cards?"

### When the answer is vague

"It just looks clean", "I like the vibe", "everything" are vague. Don't accept them and don't argue. Show what you found on that site, as candidates:

```
Here's what I noticed on Linear. Which of these is it? Pick any, and add anything I missed.
a. Headlines in a tight, quiet sans, slightly negative letter-spacing
b. 1px borders at very low contrast instead of shadows
c. Near-black dark mode with a faint gradient glow behind the hero
d. Text blurs in on load, then stays still
e. Lots of dark space; few words per screen
f. Something else
```

Their pick plus anything they add is the answer. Whatever they add that you didn't list is especially valuable: note it word for word.

## Round 2: Look

**Q5 (Q). Your brand colour, and where it shows:** only on the main action, as accents in each section, or carrying whole sections?
Why: references show other brands' colours, not theirs. How much colour shows is the biggest single difference between tastes.

**Q6 (Q). Headlines: which is closest?** Linear (tight, quiet sans), Stripe (big and confident), Apple (huge and centred), or an editorial serif? Then suggest 2 or 3 named fonts in the style they picked (avoid Inter, Roboto and Poppins as a default) and let them choose, or name one they love.
Why: type is the first thing people notice. Loved sites often mix fonts, so you can't safely guess which one they meant.

**Q7 (Q). Dark mode:** near-black, soft dark grey, or tinted with your brand colour?
Why: every build works in both themes. References usually show only one, and dark styles vary the most.

**Q8 (Q). Edges and depth, pick one primary:** crisp hairline borders, soft shadows, glass blur, or flat colour blocks?
Why: design skills disagree here (some put blur on every floating surface, others ban it), so the person decides.

**Q9 (Q). Density:** lots of air and few words per screen, or rich and informative?
Why: it sets spacing and copy length on every screen.

**Q10 (Deep). Imagery:** product screenshots, photos, illustration (line art, isometric, 3D), or type only?
Why: without it, AI fills heroes with fake dashboards and blobs. Quick mode infers it from the references.

Inferred, never asked (the references answer them): **corner radius**, **gradients and texture**, **body font**, and **neutral temperature** (warm, cool or pure grey backgrounds). Show your reading of each in this round's checklist.

## Round 3: Motion

**Q11 (Q). How much motion:** none, subtle feedback only, polished entrances, or cinematic?
Why: screenshots can't show motion, so this is the biggest blind spot in the references.

**Q12 (Q). Motion feel:** snappy, smooth and elegant, bouncy, or heavy and physical?
Why: this decides the easing and duration of every animation, and it's where motion experts disagree most. If you can show tiny examples (a sample page with four buttons animating differently), do; otherwise describe each with a site they know.

**Q13 (Q). Your entrance and hover pair:** e.g. blur-in with a lift, fade-up with a colour change, a mask reveal with no hover. If Q11 was "subtle", ask only for the hover.
Why: these two happen on every page. Picking them once makes everything feel like one hand made it.

**Q14 (Deep). Scroll:** nothing, simple reveals, scroll-scrubbed, or pinned storytelling?
Why: it changes how whole pages are built, and screenshots can't show it. Quick mode defaults to "simple reveals, or nothing if Q11 was none" and shows it in the checklist.

If Q11 is "none", skip Q12 to Q14 and write "no motion beyond state feedback". Press and focus feedback still use the Snappy small and medium values (writing-the-skill.md), with no entrance.

## Round 4: Rules

**Q15 (Q). Copy voice:** write two short headlines for the same product in different voices (e.g. plain and confident vs. warm and playful). Ask them to pick one or rewrite it their way.
Why: generic copy makes good UI feel generic, and references rarely show a voice clearly.

**Q16 (Q). When your request is vague:** should the skill ask you one question first, or decide and show you the brief?
Why: it decides how the skill behaves on every request, every day.

## Round checklist

After each round, show what you are about to write, before writing it:

```
Here's what I'll add to your skill from this round:
1. Brand colour #481DE8 on the main action only. (answered)
2. Headlines: tight grotesk in Geist, like Linear. (answered)
3. Corners: slightly soft, about 8px on cards, pill buttons. (inferred from Vercel and Linear)
4. Dark mode: near-black. (accepted without comment)

3 and 4: you didn't tell me these yourself. Do you want to add each of them to your skill?
3. 8px corners and pill buttons, or sharper 2px everywhere?
4. Near-black, or soft dark grey?
```

- Every item marked *inferred* or *accepted without comment* needs its own answer. Name the closest alternative beside it, so even a quick reply is a real choice.
- This checklist is the only place rule 2 is applied; don't also confirm after each question.
- A no gets one question: "Why not, and what would you want instead?" Log the reason (writing-the-skill.md, feedback log).
- "Yes to all" is only valid after each item has been shown with what it means.

## Conflicts

If two answers conflict ("cinematic motion" but "I hate things moving"), ask which wins and where, in one question. Write the answer as a scoped rule ("cinematic in the hero only; everything else still").
