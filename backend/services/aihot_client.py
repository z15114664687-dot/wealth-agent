from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from time import time
from typing import Any, Dict, List, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_URL = 'https://aihot.virxact.com'
USER_AGENT = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/124.0.0.0 Safari/537.36'
)
CACHE_SECONDS = 300

CATEGORY_LABELS = {
    'ai-models': '模型发布/更新',
    'ai-products': '产品发布/更新',
    'industry': '行业动态',
    'paper': '论文研究',
    'tip': '技巧与观点',
    None: '未分类',
}

FOCUS_AREAS = {
    'robotics': {
        'label': '机器人',
        'keywords': [
            '机器人',
            '人形机器人',
            '具身',
            '具身智能',
            'embodied',
            'robot',
            'robotics',
            'humanoid',
            'quadruped',
        ],
    },
    'autonomous': {
        'label': '自动驾驶',
        'keywords': [
            '自动驾驶',
            '智驾',
            '辅助驾驶',
            '无人驾驶',
            'autonomous',
            'self-driving',
            'self driving',
            'robotaxi',
            'adas',
            'waymo',
            'tesla fsd',
            '小鹏',
            '蔚来',
            '理想',
        ],
    },
    'bio-health': {
        'label': '生物医疗 / AI4Science',
        'keywords': [
            '生物',
            '医疗',
            '医药',
            '药物',
            '蛋白',
            '基因',
            '生命科学',
            'ai for science',
            'ai4science',
            'health',
            'healthcare',
            'medical',
            'biotech',
            'biology',
            'drug',
            'pharma',
            'alphafold',
        ],
    },
    'enterprise': {
        'label': 'B端智能化',
        'keywords': [
            'b端',
            'to b',
            '企业',
            '产业智能',
            '产业智能化',
            '工业',
            '制造',
            '供应链',
            '客服',
            '办公',
            'enterprise',
            'workflow',
            'workflows',
            'agent',
            'rpa',
            'crm',
            'erp',
            'manufacturing',
            'customer service',
            'contact center',
            'productivity',
        ],
    },
}

_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}


class AiHotClientError(Exception):
    pass


def fetch_aihot_items(
    mode: str = 'selected',
    category: str = 'all',
    focus: str = 'all',
    days: int = 7,
    take: int = 50,
    cursor: Optional[str] = None,
    q: Optional[str] = None,
) -> Dict[str, Any]:
    params: Dict[str, Any] = {
        'mode': mode if mode in {'selected', 'all'} else 'selected',
        'take': max(1, min(take, 100)),
        'since': _since_iso(days),
    }

    if category in CATEGORY_LABELS and category is not None:
        params['category'] = category
    if cursor:
        params['cursor'] = cursor
    if q and len(q.strip()) >= 2:
        params['q'] = q.strip()[:200]

    raw = _get_json('/api/public/items', params)
    enriched = [_enrich_item(item) for item in raw.get('items', [])]

    if focus in FOCUS_AREAS:
        enriched = [item for item in enriched if any(tag['key'] == focus for tag in item['focus_tags'])]

    return {
        'count': len(enriched),
        'hasNext': bool(raw.get('hasNext')),
        'nextCursor': raw.get('nextCursor'),
        'items': enriched,
        'summary': _build_summary(enriched),
        'focusAreas': _focus_area_options(),
        'categoryLabels': CATEGORY_LABELS,
        'source': 'AI HOT',
    }


def _since_iso(days: int) -> str:
    clamped_days = max(1, min(days, 7))
    return (datetime.now(timezone.utc) - timedelta(days=clamped_days)).strftime('%Y-%m-%dT%H:%M:%SZ')


def _get_json(path: str, params: Dict[str, Any]) -> Dict[str, Any]:
    url = f'{BASE_URL}{path}?{urlencode(params)}'
    cached = _cache.get(url)
    if cached and cached[0] > time():
        return cached[1]

    request = Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'application/json'})
    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except HTTPError as exc:
        raise AiHotClientError(f'AI HOT returned HTTP {exc.code}') from exc
    except URLError as exc:
        raise AiHotClientError('AI HOT is temporarily unavailable') from exc
    except json.JSONDecodeError as exc:
        raise AiHotClientError('AI HOT returned an invalid response') from exc

    _cache[url] = (time() + CACHE_SECONDS, payload)
    return payload


def _enrich_item(item: Dict[str, Any]) -> Dict[str, Any]:
    category = item.get('category')
    focus_tags = _infer_focus_tags(item)
    return {
        'id': item.get('id'),
        'title': item.get('title') or item.get('title_en') or '未命名资讯',
        'title_en': item.get('title_en'),
        'url': item.get('url'),
        'source': item.get('source') or 'Unknown',
        'publishedAt': item.get('publishedAt'),
        'summary': item.get('summary') or '',
        'category': category,
        'categoryLabel': CATEGORY_LABELS.get(category, '未分类'),
        'focus_tags': focus_tags,
        'isCoreIndustry': bool(focus_tags),
    }


def _infer_focus_tags(item: Dict[str, Any]) -> List[Dict[str, str]]:
    haystack = ' '.join(
        str(item.get(key) or '') for key in ['title', 'title_en', 'summary', 'source']
    ).lower()
    tags: List[Dict[str, str]] = []
    for key, config in FOCUS_AREAS.items():
        if any(keyword.lower() in haystack for keyword in config['keywords']):
            tags.append({'key': key, 'label': config['label']})
    return tags


def _build_summary(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    focus_counts = {key: 0 for key in FOCUS_AREAS}
    category_counts: Dict[str, int] = {}
    for item in items:
        category_label = item.get('categoryLabel') or '未分类'
        category_counts[category_label] = category_counts.get(category_label, 0) + 1
        for tag in item.get('focus_tags', []):
            focus_counts[tag['key']] += 1

    return {
        'total': len(items),
        'coreIndustryTotal': sum(focus_counts.values()),
        'focusCounts': focus_counts,
        'categoryCounts': category_counts,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }


def _focus_area_options() -> List[Dict[str, str]]:
    return [{'key': key, 'label': value['label']} for key, value in FOCUS_AREAS.items()]
