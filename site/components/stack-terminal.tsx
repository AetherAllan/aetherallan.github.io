"use client"

import { useEffect, useRef, useState } from "react"

type Line = { prompt?: string; text: string; tone?: "muted" | "ok" | "warn" | "accent" | "ascii" | "key" }

const neofetch: Line[] = [
  "   █████╗ ███████╗████████╗██╗  ██╗███████╗██████╗ ",
  "  ██╔══██╗██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗",
  "  ███████║█████╗     ██║   ███████║█████╗  ██████╔╝",
  "  ██╔══██║██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗",
  "  ██║  ██║███████╗   ██║   ██║  ██║███████╗██║  ██║",
  "  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝",
].map((text) => ({ text, tone: "ascii" }))

const fastfetch: Line[] = [
  ...neofetch,
  { text: "user: AetherAllan", tone: "key" },
  { text: "role: product-minded software developer", tone: "key" },
  { text: "focus: AI / Web3 / games / security writing", tone: "key" },
  { text: "style: clear interfaces, careful systems, concise notes", tone: "key" },
  { text: "notes: /notes/", tone: "key" },
  { text: "contact: mailto:aetherallan@gmail.com", tone: "key" },
  { text: "Type HELP to inspect available commands.", tone: "muted" },
]

const replies: Record<string, string[]> = {
  help: ["commands: help, neofetch, frontend, backend, ai, web3, games, notes, contact, clear"],
  neofetch: fastfetch.map((line) => line.text),
  frontend: ["I build product-facing interfaces with a bias toward clarity, motion, and maintainability."],
  backend: ["I work with API services, auth boundaries, data flow, and product systems without turning them into buzzword lists."],
  ai: ["I am interested in AI as a product layer: context, retrieval, review flows, and useful copilot behavior."],
  web3: ["I write and build around blockchain interfaces, Move security notes, and explicit trust boundaries."],
  games: ["I like interactive prototypes where narrative state, systems, and interface feedback matter."],
  notes: ["open /notes/ for the Obsidian-backed Quartz vault."],
  contact: ["mailto:aetherallan@gmail.com"],
}

function lineClass(line: Line) {
  if (line.tone === "ascii") return "terminal-ascii"
  if (line.tone === "ok") return "text-emerald-300"
  if (line.tone === "warn") return "text-amber-300"
  if (line.tone === "accent") return "text-sky-300"
  if (line.tone === "key") return "terminal-key"
  return "text-zinc-400"
}

export function StackTerminal() {
  const [booting, setBooting] = useState(true)
  const [lines, setLines] = useState<Line[]>([{ text: "00" }])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => setLines([{ text: "[SYS] BIOS Check... OK", tone: "ok" }]), 650),
      setTimeout(() => setLines((current) => [...current, { text: "[SYS] Loading public profile modules...", tone: "warn" }]), 1100),
      setTimeout(() => setLines((current) => [...current, { text: "> SYSTEM READY.", tone: "ok" }]), 1650),
      setTimeout(() => {
        setBooting(false)
        setLines((current) => [...current, { prompt: "guest@noir:~$", text: "neofetch", tone: "accent" }, ...fastfetch])
      }, 2150),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => bottomRef.current?.scrollIntoView({ block: "end" }), [lines])

  function run(command: string) {
    const key = command.trim().toLowerCase()
    if (!key) return
    if (key === "clear") {
      setLines([])
      return
    }
    const response = replies[key] ?? [`command not found: ${command}`, "type help"]
    setLines((current) => [...current, { prompt: "guest@noir:~$", text: command.toUpperCase(), tone: "accent" }, ...response.map((text) => ({ text }))])
  }

  return (
    <div className="crt noir-panel terminal-card min-h-[78vh] p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.12] pb-3 text-[11px] text-zinc-500">
        <span>aetherallan@profile:~</span>
        <span>{booting ? "BOOTING" : "ONLINE"}</span>
      </div>
      <div className="h-[60vh] overflow-y-auto pr-2 font-mono text-[12px] leading-6 text-zinc-200 sm:text-sm sm:leading-7">
        {lines.map((line, index) => (
          <div key={`${line.text}-${index}`} className={index === 0 && line.text === "00" ? "text-6xl font-black" : lineClass(line)}>
            {line.prompt ? <span className="text-zinc-500">{line.prompt} </span> : null}
            <span>{line.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {!booting ? (
        <form
          className="mt-5 flex border-t border-white/[0.12] pt-4 text-sm"
          onSubmit={(event) => {
            event.preventDefault()
            run(input)
            setInput("")
          }}
        >
          <span className="mr-2 text-zinc-500">guest@noir:~$</span>
          <input
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              run(event.currentTarget.value)
              setInput("")
            }}
            className="terminal-input min-w-0 flex-1 bg-transparent uppercase text-zinc-100 outline-none"
            aria-label="Terminal command"
          />
        </form>
      ) : null}
    </div>
  )
}
