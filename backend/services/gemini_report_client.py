import os
from dotenv import load_dotenv

load_dotenv()

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
            response = self._client.models.generate_content(model=self.model, contents=prompt)
            return (response.text or '').strip()
        return self._fallback(prompt)

    def _fallback(self, prompt: str) -> str:
        return (
            '概览\n'
            '当前报告由 fallback 模式生成，因为当前环境没有可用的 Gemini API。系统仍然完成了数据获取、信号计算、个性化适配和护栏说明。\n\n'
            '解释\n'
            '这是一份演示安全输出。将 GEMINI_API_KEY 写入 backend/.env 并重启后端后，报告会切换为 Gemini 生成。\n\n'
            '提示词上下文\n'
            f'{prompt[:800]}'
        )
