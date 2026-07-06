import logging
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiReportClient:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '').strip()
        self.model = os.getenv('GEMINI_MODEL', 'gemini-2.5-pro')
        self.available = bool(self.api_key)
        self._client = None
        if self.available:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                self.available = False

    def generate_report(self, prompt: str) -> str:
        if self.available and self._client is not None:
            try:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
                return (response.text or '').strip()
            except Exception as e:
                logger.warning('Gemini report generation failed: %s', e)
        return self._fallback(prompt)

    def generate_json(self, prompt: str) -> dict:
        if self.available and self._client is not None:
            try:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
                return self._parse_json(response.text or '')
            except Exception as e:
                logger.warning('Gemini JSON generation failed: %s', e)
        return {}

    def _parse_json(self, text: str) -> dict:
        cleaned = text.strip()
        if not cleaned:
            return {}

        fenced = re.search(r'```(?:json)?\s*(.*?)\s*```', cleaned, re.S)
        if fenced:
            cleaned = fenced.group(1).strip()

        start = cleaned.find('{')
        end = cleaned.rfind('}')
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start:end + 1]

        try:
            payload = json.loads(cleaned)
        except json.JSONDecodeError:
            return {}

        return payload if isinstance(payload, dict) else {}

    def _fallback(self, prompt: str) -> str:
        return (
            '概览\n'
            '当前报告由 fallback 模式生成，因为当前环境没有可用的 Gemini API。系统仍然完成了数据获取、信号计算、个性化适配和护栏说明。\n\n'
            '解释\n'
            '这是一份演示安全输出。将 GEMINI_API_KEY 写入 backend/.env 并重启后端后，报告会切换为 Gemini 生成。\n\n'
            '提示词上下文\n'
            f'{prompt[:800]}'
        )
