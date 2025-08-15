# @ironm00n/pyret-embed

A modern, TypeScript-first library for embedding Pyret into webpages with Next.js 14+ support.

## Installation

```bash
npm install @ironm00n/pyret-embed
```

## Browser Support

This library targets modern browsers and requires:

- ES2024 features support (including `Promise.withResolvers()`)

## Usage

### Next.js 14+ (App Router)

```tsx
"use client";

import { useEffect, useRef } from "react";
import { makeEmbedConfig } from "@ironm00n/pyret-embed";

export default function PyretEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    makeEmbedConfig({
      container: containerRef.current,
      state: {
        editorContents: "use context starter2024\n\n'Hello from Next.js!'",
        replContents: "",
        definitionsAtLastRun: "",
        interactionsSinceLastRun: [],
      },
      options: {
        footerStyle: "hide",
        warnOnExit: false,
      },
    });
  }, []);

  return <div ref={containerRef} className="w-full h-96" />;
}
```

### Traditional HTML/JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { makeEmbed } from "@ironm00n/pyret-embed/api";

      async function initPyret() {
        const container = document.getElementById("pyret-container");
        const embed = await makeEmbed("pyret-1", container);

        embed.sendReset({
          editorContents: "use context starter2024\n\n'Hello World!'",
          replContents: "",
          definitionsAtLastRun: "",
          interactionsSinceLastRun: [],
        });
      }

      window.addEventListener("load", initPyret);
    </script>
  </head>
  <body>
    <div id="pyret-container" style="width: 100%; height: 400px;"></div>
  </body>
</html>
```

### Vanilla JavaScript

```javascript
import { makeEmbed } from "@ironm00n/pyret-embed/api";

const container = document.getElementById("pyret-container");
makeEmbed("pyret-1", container).then((embed) => {
  embed.sendReset({
    editorContents: "use context starter2024\n\n'Hello!'",
    replContents: "",
    definitionsAtLastRun: "",
    interactionsSinceLastRun: [],
  });
});
```

## API Reference

See [src/pyret.ts](src/pyret.ts) for full API documentation.

## Development

### With Nix (Recommended)

```bash
nix develop
npm install
npm run build
```

### Without Nix

```bash
npm install
npm run build
```

### Available Scripts

- `npm run build` - Build the package
- `npm run dev` - Build in watch mode
- `npm run clean` - Clean build artifacts
- `npm run typecheck` - Type check without building

## Examples

See the `examples/` directory for complete working examples:

- `basic.html` - Basic HTML usage
- `fs.html` - File system integration
- `nextjs-example.tsx` - Next.js component
- `simple-test.html` - Simple test page
- Various JavaScript examples
