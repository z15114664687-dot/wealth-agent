import { NewsRadar } from '@/components/news/NewsRadar';

export default function NewsPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
              /// AI INDUSTRY RADAR
            </p>
            <h1 className="mt-3 font-display text-5xl font-black leading-none tracking-normal md:text-7xl">
              AI 产业雷达
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-8 text-gray-700 lg:justify-self-end">
            汇总 AI HOT 的实时动态，默认优先看精选资讯；模型、产品之外，重点标记机器人、
            自动驾驶、生物医疗与 AI for Science、B 端智能化等产业方向。
          </p>
        </div>

        <NewsRadar />
      </div>
    </div>
  );
}
