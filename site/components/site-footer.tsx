export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-5 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>Signal Noir / AetherAllan</p>
      <div className="flex gap-5">
        <a href="/notes/" className="hover:text-zinc-100">
          Notes
        </a>
        <a href="/notes/index.xml" className="hover:text-zinc-100">
          RSS
        </a>
        <a href="https://github.com/AetherAllan" className="hover:text-zinc-100">
          GitHub
        </a>
      </div>
    </footer>
  )
}
