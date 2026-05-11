import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b-4 border-ink bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-black tracking-tighter">
          WEALTHAGENT AI
        </Link>
        <div className="hidden gap-5 text-xs font-bold tracking-[0.16em] lg:flex lg:gap-8 lg:text-sm lg:tracking-[0.22em]">
          <Link href="/workspace" className="hover:underline">研究台</Link>
          <Link href="/news" className="hover:underline">AI资讯</Link>
          <Link href="/watchlist" className="hover:underline">观察列表</Link>
          <Link href="/portfolio" className="hover:underline">组合诊断</Link>
          <Link href="/lab" className="hover:underline">实验室</Link>
          <Link href="/about" className="hover:underline">系统说明</Link>
        </div>
      </div>
    </nav>
  );
}
