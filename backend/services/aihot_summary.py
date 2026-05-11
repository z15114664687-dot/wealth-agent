from __future__ import annotations

import html
import os
from datetime import datetime
from io import BytesIO
from typing import Any, Dict, List
from zipfile import ZIP_DEFLATED, ZipFile

from dotenv import load_dotenv


load_dotenv()


SUMMARY_MODEL = os.getenv('GEMINI_SUMMARY_MODEL', 'gemini-3.0-pro')


class AiHotSummaryClient:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '').strip()
        self.model = SUMMARY_MODEL
        self.available = bool(self.api_key)
        self._client = None
        if self.available:
            try:
                from google import genai

                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                self.available = False

    def summarize(self, items: List[Dict[str, Any]], context: Dict[str, Any]) -> str:
        prompt = self._build_prompt(items, context)
        if self.available and self._client is not None:
            try:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
                return self._normalize_text(response.text or '')
            except Exception:
                return self._fallback(items, context)
        return self._fallback(items, context)

    def _build_prompt(self, items: List[Dict[str, Any]], context: Dict[str, Any]) -> str:
        item_lines = []
        for index, item in enumerate(items[:40], start=1):
            tags = '、'.join(tag.get('label', '') for tag in item.get('focus_tags', [])) or '无'
            item_lines.append(
                f"{index}. 标题：{item.get('title', '')}\n"
                f"来源：{item.get('source', '')}\n"
                f"分类：{item.get('categoryLabel', '')}\n"
                f"重点赛道：{tags}\n"
                f"摘要：{item.get('summary', '')}\n"
                f"链接：{item.get('url', '')}"
            )

        return f"""
你是 WealthAgent AI 的产业研究助手。请基于下列 AI HOT 资讯，生成一份中文 AI 产业动态总结。

筛选条件：
模式：{context.get('mode', 'selected')}
分类：{context.get('category', 'all')}
重点赛道：{context.get('focus', 'all')}
时间窗口：近 {context.get('days', 7)} 天
关键词：{context.get('query') or '无'}

资讯列表：
{chr(10).join(item_lines)}

输出要求：
1. 只使用中文。
2. 不使用 Markdown 符号，不要使用 #、**、- 作为格式。
3. 使用普通报告格式，保留以下小标题：核心结论、重要动态、重点赛道观察、可能影响、后续关注。
4. 聚焦模型和产品之外的产业方向，尤其关注机器人、自动驾驶、生物医疗 / AI for Science、B 端智能化。
5. 不要编造列表之外的事实；如果信息不足，明确说“需要继续跟踪”。
6. 控制在 700 到 1000 个中文字符。
""".strip()

    def _fallback(self, items: List[Dict[str, Any]], context: Dict[str, Any]) -> str:
        industry_items = [item for item in items if item.get('isCoreIndustry')]
        top_titles = '；'.join(item.get('title', '') for item in items[:5])
        focus_titles = '；'.join(item.get('title', '') for item in industry_items[:5]) or '当前筛选结果中重点赛道条目有限'
        return self._normalize_text(
            f"""
核心结论
当前筛选结果共覆盖 {len(items)} 条 AI HOT 动态，主要信息包括：{top_titles}。整体看，模型、产品和产业应用仍在同步推进，需要结合后续融资、客户落地和产品可用性继续跟踪。

重要动态
近期动态集中在新工具发布、模型能力更新、AI 基础设施和应用产品迭代。部分条目来自企业官方渠道，部分来自行业媒体或社交平台，适合作为早期情报线索，但关键业务影响仍需要回到原文和公司公告复核。

重点赛道观察
机器人、自动驾驶、生物医疗 / AI for Science、B 端智能化相关线索包括：{focus_titles}。其中 B 端智能化更容易与企业工作流、开发者工具和生产力平台结合，机器人和医疗方向则更依赖硬件、数据、监管或实验验证。

可能影响
对投资研究而言，这些动态可以帮助识别产业叙事和技术扩散速度，但不能单独构成投资判断。更重要的是观察订单、毛利、客户留存、生态伙伴和监管约束是否跟上。

后续关注
建议继续跟踪重点赛道的产品可用性、商业化证据、头部公司合作、融资进展和政策变化。当前总结由 fallback 模式生成，因为 Gemini API 在当前环境不可用或未配置。
"""
        )

    def _normalize_text(self, text: str) -> str:
        return '\n'.join(line.rstrip() for line in text.strip().splitlines() if line.strip())


def build_summary_docx(summary: str, title: str = 'AI 产业动态总结') -> bytes:
    buffer = BytesIO()
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M')
    paragraphs = [title, f'生成时间：{created_at}', *summary.splitlines()]

    with ZipFile(buffer, 'w', ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', _content_types_xml())
        docx.writestr('_rels/.rels', _rels_xml())
        docx.writestr('word/_rels/document.xml.rels', _document_rels_xml())
        docx.writestr('word/styles.xml', _styles_xml())
        docx.writestr('word/document.xml', _document_xml(paragraphs))

    return buffer.getvalue()


def _document_xml(paragraphs: List[str]) -> str:
    body = ''.join(_paragraph_xml(paragraph, index == 0) for index, paragraph in enumerate(paragraphs))
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""


def _paragraph_xml(text: str, is_title: bool = False) -> str:
    escaped = html.escape(text)
    if is_title:
        run_props = '<w:b/><w:sz w:val="36"/><w:szCs w:val="36"/>'
        spacing = '<w:spacing w:after="280"/>'
    else:
        run_props = '<w:sz w:val="24"/><w:szCs w:val="24"/>'
        spacing = '<w:spacing w:after="180" w:line="360" w:lineRule="auto"/>'
    return f"""
    <w:p>
      <w:pPr>{spacing}</w:pPr>
      <w:r>
        <w:rPr>{run_props}</w:rPr>
        <w:t>{escaped}</w:t>
      </w:r>
    </w:p>"""


def _content_types_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""


def _rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""


def _document_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>"""


def _styles_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/>
    </w:rPr>
  </w:style>
</w:styles>"""
