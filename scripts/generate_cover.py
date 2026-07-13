"""
DaoEssence 封面图生成脚本
使用 DashScope API 生成文章封面图
"""

import requests
import json
import os
from datetime import datetime

# DashScope API 配置
DASHSCOPE_API_KEY = os.environ.get('DASHSCOPE_API_KEY', 'sk-3279d0453a4940c5bbf2010722f1e86b')
API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

def generate_cover(prompt, output_path):
    """生成封面图"""
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
    }
    
    data = {
        "model": "wanx-v1",
        "input": {
            "prompt": prompt
        },
        "parameters": {
            "size": "1024*1024",
            "n": 1
        }
    }
    
    # 提交任务
    response = requests.post(API_URL, headers=headers, json=data, timeout=30)
    result = response.json()
    
    if response.status_code != 200:
        print(f"API 调用失败：{result}")
        return False
    
    task_id = result.get('output', {}).get('task_id')
    if not task_id:
        print(f"未获取到 task_id: {result}")
        return False
    
    print(f"任务已提交：{task_id}")
    
    # 轮询任务状态
    import time
    for _ in range(30):  # 最多等待 60 秒
        time.sleep(2)
        
        status_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
        status_response = requests.get(status_url, headers=headers, timeout=10)
        status_result = status_response.json()
        
        task_status = status_result.get('output', {}).get('task_status')
        
        if task_status == 'SUCCEEDED':
            # 下载图片
            images = status_result.get('output', {}).get('results', [])
            if images:
                image_url = images[0].get('url')
                if image_url:
                    img_response = requests.get(image_url, timeout=30)
                    with open(output_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"封面图已保存：{output_path}")
                    return True
        
        elif task_status == 'FAILED':
            print(f"任务失败：{status_result}")
            return False
    
    print("任务超时")
    return False


if __name__ == "__main__":
    # 文章信息
    title_cn = "八字亲子兼容性"
    title_en = "BaZi Parent-Child Compatibility"
    visual_element = "Two interlocking golden silhouettes representing parent and child, harmonious yin-yang inspired composition, traditional Chinese family bond imagery, minimalist line art style"
    
    # 封面图提示词（中文大标题 + 英文小标题）
    prompt = f"""Premium editorial magazine poster, vertical 9:16 aspect ratio.

BACKGROUND: Matte black textured background with subtle rice paper texture overlay.

VISUAL ELEMENT (center/bottom two-thirds): {visual_element}

TYPOGRAPHY (top third reserved for text):
- Large Chinese title in gold foil calligraphy style: "{title_cn}"
- Smaller English subtitle below in elegant serif font: "{title_en}"
- Gold foil effect with subtle glow on Chinese title
- English subtitle in antique gold color

COLOR PALETTE: Matte black + antique gold + sparing vermillion accent (seal stamp in lower right corner)

STYLE: Kinfolk magazine meets Chinese luxury brand campaign. Museum-catalogue aesthetic. Minimalist line art. Generous negative space.

PROHIBITED: NO 3D rendering, NO blur, NO fog, NO haze, NO cartoon, NO emoji, NO busy patterns, NO text overlay in visual element area."""

    output_path = "C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\images\\bazi-parent-child-compatibility-cover.webp"
    
    print("开始生成封面图...")
    success = generate_cover(prompt, output_path)
    
    if success:
        print("✅ 封面图生成成功")
    else:
        print("❌ 封面图生成失败")
