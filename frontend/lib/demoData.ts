import {
  CompanyProfile,
  CompetitiveLandscape,
  FinancialAnalysis,
  FundamentalAnalysis,
  TechnicalStack,
} from './types';

export const tickerUniverse = ['000001', '002594', '300750', '600030', '600036', '600276', '600519', '600900', '601088', '601318', '601899'];

export const companyProfiles: Record<string, CompanyProfile> = {
  '600519': {
    sector: '主要消费 / 白酒',
    style: '防御型高质量复利资产',
    description: '贵州茅台是高端白酒龙头，具备强品牌、渠道议价权和稳定现金流，是 A 股消费板块的重要质量锚。',
    tags: ['质量', '消费', '防御', '高端'],
    valuation: [
      { label: '市值', value: '2100 bn' },
      { label: 'PE TTM', value: '28.4' },
      { label: 'PB', value: '8.90' },
      { label: '股息率', value: '2.8%' },
    ],
    watchpoints: ['批价纪律与渠道库存', '节假日动销韧性', '高毛利能否抵御消费放缓'],
    dataNotes: ['行情优先来自 Tushare。', '公司描述与观察点用于研究辅助，不构成投资建议。'],
  },
  '300750': {
    sector: '工业 / 动力电池',
    style: '高波动成长龙头',
    description: '宁德时代处在新能源车与储能产业链核心位置，成长性强，但盈利弹性和估值波动也更高。',
    tags: ['成长', '新能源', '电池', '制造'],
    valuation: [
      { label: '市值', value: '980 bn' },
      { label: 'PE TTM', value: '24.8' },
      { label: 'PB', value: '5.10' },
      { label: '股息率', value: '1.1%' },
    ],
    watchpoints: ['电池价格竞争', '海外产能与客户拓展', '储能需求兑现节奏'],
    dataNotes: ['适合检验成长股动量与波动解释。', '估值字段为演示口径。'],
  },
  '000001': {
    sector: '金融 / 商业银行',
    style: '低估值稳健资产',
    description: '平安银行代表银行板块的低估值、分红和资产质量观察样本，重点在息差、信用成本与资本充足率。',
    tags: ['金融', '分红', '低估值', '稳健'],
    valuation: [
      { label: '市值', value: '210 bn' },
      { label: 'PE TTM', value: '5.8' },
      { label: 'PB', value: '0.55' },
      { label: '股息率', value: '5.2%' },
    ],
    watchpoints: ['净息差压力', '地产相关风险', '分红稳定性'],
    dataNotes: ['银行股分析应结合资产质量。', '本页面仅展示研究框架。'],
  },
};

export function getCompanyProfile(ticker: string): CompanyProfile {
  return companyProfiles[ticker] || {
    sector: 'A 股 / 综合',
    style: '通用研究样本',
    description: '该标的暂无完整公司画像，系统会使用通用 A 股研究框架展示技术面、财务面和风险观察。',
    tags: ['A股', '研究', '监控'],
    valuation: [
      { label: '市值', value: 'N/A' },
      { label: 'PE TTM', value: 'N/A' },
      { label: 'PB', value: 'N/A' },
      { label: '股息率', value: 'N/A' },
    ],
    watchpoints: ['盈利趋势', '估值位置', '行业景气度'],
    dataNotes: ['可后续接入 Tushare 基本面接口。'],
  };
}

export function getTechnicalStack(ticker: string): TechnicalStack {
  const table: Record<string, TechnicalStack> = {
    '600519': { rsi14: 47.75, macd: 2.8194, macd_signal: 4.407, band_view: '布林带区间内', support: 1401.18, resistance: 1467.5 },
    '300750': { rsi14: 61.54, macd: 8.294, macd_signal: 6.118, band_view: '接近上轨', support: 418.2, resistance: 462.8 },
    '000001': { rsi14: 43.8, macd: -0.032, macd_signal: -0.018, band_view: '中轨下方', support: 10.72, resistance: 11.46 },
  };
  return table[ticker] || { rsi14: 50.2, macd: 0.42, macd_signal: 0.38, band_view: '中性区间', support: 48.2, resistance: 53.6 };
}

export function getFinancialAnalysis(ticker: string): FinancialAnalysis {
  const table: Record<string, FinancialAnalysis> = {
    '600519': {
      revenue_growth: '+18.0%',
      gross_margin: '约 91%',
      net_margin: '约 53%',
      roe: '约 31%',
      operating_cashflow: '强',
      leverage: '低',
      summary: '财务质量的核心在高毛利、高净利率、高 ROE 与稳健现金流，适合作为防御型消费龙头研究样本。',
    },
    '300750': {
      revenue_growth: '+22.0%',
      gross_margin: '约 22%',
      net_margin: '约 10%',
      roe: '约 24%',
      operating_cashflow: '中高',
      leverage: '中等',
      summary: '财务表现更偏成长与制造业扩张，收入增长强，但需要关注价格竞争对毛利率和资本开支回报的影响。',
    },
    '000001': {
      revenue_growth: '+2.5%',
      gross_margin: '不适用',
      net_margin: '约 28%',
      roe: '约 11%',
      operating_cashflow: '稳定',
      leverage: '金融杠杆',
      summary: '银行股财务分析应重点观察净息差、不良率、拨备覆盖和资本充足率，而不是普通制造业毛利率。',
    },
  };
  return table[ticker] || {
    revenue_growth: '待接入',
    gross_margin: '待接入',
    net_margin: '待接入',
    roe: '待接入',
    operating_cashflow: '待接入',
    leverage: '待接入',
    summary: '当前为通用财务分析占位，后续可接 Tushare 利润表、资产负债表和现金流量表接口。',
  };
}

export function getFundamentalAnalysis(ticker: string): FundamentalAnalysis {
  const profile = getCompanyProfile(ticker);
  const financial = getFinancialAnalysis(ticker);
  return {
    business_quality: `${profile.style}。业务画像显示其核心标签为 ${profile.tags.join('、')}。`,
    valuation_view: `当前估值关注 ${profile.valuation.map((item) => `${item.label} ${item.value}`).join('，')}，需要与历史分位和行业可比公司对照。`,
    growth_driver: ticker === '600519' ? '增长主要来自产品结构、高端白酒需求和渠道价格纪律。' : ticker === '300750' ? '增长主要来自动力电池份额、储能放量和海外客户拓展。' : '增长驱动需要结合行业周期、财务趋势和公司指引进一步确认。',
    risk_watch: `主要观察点：${profile.watchpoints.join('；')}。`,
    conclusion: `基本面结论：${financial.summary}`,
  };
}

export function getCompetitiveLandscape(ticker: string): CompetitiveLandscape {
  const table: Record<string, CompetitiveLandscape> = {
    '600519': {
      position: '高端白酒绝对龙头',
      moat: '品牌稀缺性、渠道控制力、价格带优势和强现金流形成护城河。',
      competitors: [
        { name: '五粮液', ticker: '000858', angle: '浓香高端酒', relative_position: '品牌强，但价格锚弱于茅台' },
        { name: '泸州老窖', ticker: '000568', angle: '高端与次高端', relative_position: '增长弹性较强，体量小于茅台' },
        { name: '山西汾酒', ticker: '600809', angle: '清香型全国化', relative_position: '扩张速度快，但品类心智不同' },
      ],
      summary: '竞争格局偏寡头，高端价格带更关注品牌势能与渠道秩序，而非单纯产能竞争。',
    },
    '300750': {
      position: '全球动力电池第一梯队',
      moat: '技术迭代、规模制造、客户绑定和供应链管理能力共同构成优势。',
      competitors: [
        { name: '比亚迪', ticker: '002594', angle: '整车 + 电池一体化', relative_position: '垂直整合强，外供属性不同' },
        { name: '亿纬锂能', ticker: '300014', angle: '电池多品类', relative_position: '细分增长快，规模较小' },
        { name: '国轩高科', ticker: '002074', angle: '磷酸铁锂', relative_position: '成本路线明确，盈利质量需观察' },
      ],
      summary: '竞争更动态，价格战、技术路线和海外政策都会改变利润池分配。',
    },
  };
  return table[ticker] || {
    position: '行业位置待确认',
    moat: '需要结合市场份额、盈利能力、产品差异化和渠道壁垒判断。',
    competitors: [
      { name: '可比公司 A', ticker: '-', angle: '同业比较', relative_position: '待补充' },
      { name: '可比公司 B', ticker: '-', angle: '估值比较', relative_position: '待补充' },
    ],
    summary: '竞争格局模块已预留，可后续接入行业分类和可比公司筛选。',
  };
}

export const portfolioPositions = [
  { ticker: '600519', name: '贵州茅台', sector: '主要消费 / 白酒', tags: '质量、消费、防御、高端', qty: 50, cost: 65000, marketValue: 70362, pnl: 5362, pnlPct: 8.25, return30d: -4.19, vol: 22.55, weight: 47.25 },
  { ticker: '300750', name: '宁德时代', sector: '工业 / 动力电池', tags: '新能源、电池、成长、制造', qty: 80, cost: 31200, marketValue: 35536, pnl: 4336, pnlPct: 13.9, return30d: 10.49, vol: 33.08, weight: 23.86 },
  { ticker: '002594', name: '比亚迪', sector: '可选消费 / 新能源车', tags: '新能源、成长、消费、创新', qty: 200, cost: 18400, marketValue: 20756, pnl: 2356, pnlPct: 12.8, return30d: 2.06, vol: 28.58, weight: 13.94 },
  { ticker: '600036', name: '招商银行', sector: '金融 / 商业银行', tags: '银行、质量、分红、蓝筹', qty: 300, cost: 10500, marketValue: 11856, pnl: 1356, pnlPct: 12.91, return30d: -1.0, vol: 16.51, weight: 7.96 },
  { ticker: '601899', name: '紫金矿业', sector: '材料 / 金属矿业', tags: '材料、商品、周期、黄金', qty: 300, cost: 9000, marketValue: 10419, pnl: 1419, pnlPct: 15.77, return30d: -6.54, vol: 45.54, weight: 7.0 },
];

export const labScreenResults = [
  { ticker: '601088', name: '中国神华', sector: '能源 / 煤炭', pe: 11.5, dividend: '6.8%', marketCap: '690 bn', return30d: '-0.61%' },
  { ticker: '601318', name: '中国平安', sector: '金融 / 保险', pe: 8.4, dividend: '4.9%', marketCap: '780 bn', return30d: '-7.58%' },
  { ticker: '600036', name: '招商银行', sector: '金融 / 商业银行', pe: 7.1, dividend: '4.6%', marketCap: '950 bn', return30d: '0.82%' },
];
