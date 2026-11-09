---
name: "[[Project name]]"
description: "[[One line: what this project is]]"
colors:
  primary: "[[this project's brand colour; default {{brand hex}}]]"
  background: "{{light bg}}"
  background-dark: "{{dark bg}}"
  foreground: "{{light fg}}"
  foreground-dark: "{{dark fg}}"
  muted: "{{muted text}}"
  border: "{{border}}"
typography:
  display: { fontFamily: "{{display font}}", fontWeight: "{{weight}}", letterSpacing: "{{e.g. -0.03em}}" }
  body: { fontFamily: "{{body font}}", fontSize: "16px", lineHeight: "1.6" }
rounded:
  card: "{{e.g. 8px}}"
  button: "{{e.g. 999px}}"
spacing:
  scale: "{{spacing scale, e.g. 8 16 24 40 64 96 144}}"
---

# [[Project name]]

Built on {{Person}}'s taste (see the {{skill-name}} skill). This file is this project's own version of it and is kept up to date as the project changes. `{{ }}` values came from the taste; `[[ ]]` slots are filled when the project starts.

## Overview

[[Two lines: what the project is, who it's for, the feeling it should give.]]

**Project identity** (confirmed with {{Person}} on [[date]])
- Accent use here: [[within the colour posture: {{colour posture}}]]
- Hero type: [[one from taste.md's accepted list]]
- Signature: [[one detail or motion from taste.md's accepted list]]

## Colors

[[Roles and where each is used, light and dark. Tokens also live in CSS variables.]]

## Typography

{{Display, headings, body, labels: font, size steps, tracking, case.}}

## Layout

{{Grid, container width, section spacing, density.}}

## Elevation & Depth

{{Borders, shadows or blur, and where each is allowed.}}

## Shapes

{{Radius per element; nested radii are concentric.}}

## Motion

{{Entrance, hover, press, scroll, from the taste's motion.md}}, plus this project's signature motion: [[signature]].

## Components

[[Inventory as it grows: name, path, one line.]]

## Do's and Don'ts

[[Project-specific rules.]] The taste's never list always applies.

## Decisions

- [[date]]: Created from {{Person}}'s taste.
