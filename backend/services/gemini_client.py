import os
from dotenv import load_dotenv

load_dotenv()

class GeminiMemoClient:
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

    def generate_memo(self, prompt: str) -> str:
        if self.available and self._client is not None:
            response = self._client.models.generate_content(model=self.model, contents=prompt)
            return (response.text or '').strip()
        return self._fallback(prompt)

    def _fallback(self, prompt: str) -> str:
        return (
            'Overview\n'
            'This memo was generated in fallback mode because the Gemini API is not available in the current environment.\n\n'
            'Interpretation\n'
            'The prototype still completed the agentic workflow and produced a demo-safe output. Replace this fallback by setting GEMINI_API_KEY in backend/.env.\n\n'
            'Prompt context\n'
            f'{prompt[:800]}'
        )
