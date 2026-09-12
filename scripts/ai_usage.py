# -*- coding: utf-8 -*-
"""
AI 用量记账（Python 版）—— 与 lib/ai-usage.cjs 写同一个文件，方便统一对账。

用法（在拿到接口响应后调用，绝不影响主流程）：

    from ai_usage import record_usage, record_image

    record_usage(script='scripts/generate_cover_pro.py', model='wanx-v1',
                 purpose='cover-image', images=1, ref=slug)

落盘：<项目根>/logs/ai-usage.jsonl（追加写）；关闭：环境变量 AI_USAGE_LOG=0
查账：node scripts/ai-cost-report.cjs [天数]
"""
import json
import os
import time

_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs', 'ai-usage.jsonl')

# 元 / 百万 token（估算参考价，不等于账单）
_PRICE = {
    'qwen-plus': (0.8, 2.0),
    'qwen-turbo': (0.3, 0.6),
    'qwen3.5-plus': (0.8, 2.0),
    'qwen-max': (2.4, 9.6),
    'qwen3.7-max': (2.4, 9.6),
    'qwen-vl-max': (3.0, 9.0),
    'qwen-vl-plus': (1.5, 4.5),
}
_IMAGE_PRICE = {'wanx-v1': 0.16, 'wanx2.1-t2i-turbo': 0.14, 'wanx2.1-t2i-plus': 0.20}


def _estimate(model, input_tokens, output_tokens, images):
    p = _PRICE.get(model, (1.0, 3.0))
    cny = (input_tokens / 1e6) * p[0] + (output_tokens / 1e6) * p[1]
    if images:
        cny += images * _IMAGE_PRICE.get(model, 0.16)
    return round(cny, 5)


def record_usage(script, model, purpose='', usage=None, images=0, ref='', note=''):
    """usage 传接口返回的 usage 字典（或 None）；images 传出图张数。"""
    try:
        if os.environ.get('AI_USAGE_LOG') == '0':
            return
        usage = usage or {}
        it = int(usage.get('prompt_tokens') or usage.get('input_tokens') or 0)
        ot = int(usage.get('completion_tokens') or usage.get('output_tokens') or 0)
        images = int(images or 0)
        row = {
            'ts': time.strftime('%Y-%m-%dT%H:%M:%S+08:00', time.localtime()),
            'script': script,
            'model': model,
            'purpose': purpose,
            'in': it,
            'out': ot,
            'images': images,
            'est_cny': _estimate(model, it, ot, images),
        }
        if ref:
            row['ref'] = str(ref)[:120]
        if note:
            row['note'] = str(note)[:200]
        os.makedirs(os.path.dirname(_LOG_PATH), exist_ok=True)
        with open(_LOG_PATH, 'a', encoding='utf-8') as f:
            f.write(json.dumps(row, ensure_ascii=False) + '\n')
    except Exception as e:  # 记账失败绝不影响主流程（需要排查时设 AI_USAGE_DEBUG=1）
        if os.environ.get('AI_USAGE_DEBUG') == '1':
            try:
                print('[ai-usage] 记账失败: %s' % e)
            except Exception:
                pass


def record_image(script, model, images=1, purpose='image', ref='', note=''):
    return record_usage(script=script, model=model, purpose=purpose, images=images, ref=ref, note=note)
