export function MarqueeStrip() {
  const text = 'A股智能研究 /// 财务分析 /// 基本面分析 /// 竞争格局 /// 组合诊断 /// 风险偏好适配 /// ';
  return (
    <div className="overflow-hidden border-y-4 border-ink bg-acid py-3">
      <div className="flex min-w-max animate-marquee gap-8 whitespace-nowrap font-bold uppercase tracking-[0.3em]">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
