'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-10">
      <div className="mx-auto grid max-w-7xl items-end gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">/// 面向现代投资者的智能研究工作流</p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-[16vw] font-black leading-[0.85] tracking-tighter text-ink md:text-[7rem]"
          >
            <span className="block">你的</span>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#050505] via-[#050505] to-[#7a7a7a]">
            ALPHA 代理
            </span>
          </motion.h1>
          <p className="max-w-2xl text-base leading-8 text-gray-700 md:text-lg">
            把 A 股行情、财务质量、基本面逻辑、竞争格局与组合风险组织成一套可解释的研究系统。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/workspace"><Button className="shadow-hard-blue">进入研究台</Button></Link>
            <Link href="/about"><Button className="shadow-hard-green">查看架构</Button></Link>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, rotate: -4, y: 40 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="grid-lines border-4 border-ink bg-cloud p-6 shadow-hard-pink"
        >
          <div className="mb-6 flex items-center justify-between border-b-4 border-ink pb-4">
            <span className="text-xs font-bold uppercase tracking-[0.25em]">LIVE WORKSPACE PREVIEW</span>
            <span className="border-2 border-ink px-2 py-1 text-[10px] uppercase tracking-[0.2em]">Prototype</span>
          </div>
          <div className="space-y-4 text-sm leading-7">
            <div className="border-2 border-ink bg-white p-4">
              <div className="flex justify-between"><span>600519</span><span>贵州茅台</span></div>
              <div className="mt-2 font-display text-4xl font-black">1688.50</div>
              <div className="mt-2 text-punch">+3.20% / 30D</div>
            </div>
            <div className="border-2 border-ink bg-white p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-gray-500">AGENT STATUS</div>
              <ul className="mt-3 space-y-2 uppercase tracking-[0.18em]">
                <li>数据代理 // 已完成</li>
                <li>分析代理 // 已完成</li>
                <li>报告代理 // 已完成</li>
                <li>个性化代理 // 已完成</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full -translate-x-1/2 -translate-y-1/2 opacity-5">
        <div className="font-display text-center text-[24vw] font-black leading-none tracking-tighter">ALPHA</div>
      </div>
    </section>
  );
}
