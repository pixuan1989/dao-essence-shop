"""
DaoEssence 封面图生成脚本 v3
生成背景图 + 叠加中英文标题（书法字体 + 金色描边）
"""

import requests
import os
from PIL import Image, ImageDraw, ImageFont
import textwrap

# DashScope API 配置（禁止硬编码 key；已从代码中移除泄露的 sk-3279...）
DASHSCOPE_API_KEY = os.environ.get('DASHSCOPE_API_KEY')
if not DASHSCOPE_API_KEY:
    raise ValueError("DASHSCOPE_API_KEY environment variable is required")
API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

def generate_background(prompt, output_path):
    """生成背景图"""
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
    }
    
    data = {
        "model": "wanx-v1",
        "input": {"prompt": prompt},
        "parameters": {"size": "1024*1024", "n": 1}
    }
    
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
    
    import time
    for _ in range(30):
        time.sleep(2)
        status_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
        status_response = requests.get(status_url, headers=headers, timeout=10)
        status_result = status_response.json()
        
        task_status = status_result.get('output', {}).get('task_status')
        
        if task_status == 'SUCCEEDED':
            images = status_result.get('output', {}).get('results', [])
            if images:
                image_url = images[0].get('url')
                if image_url:
                    img_response = requests.get(image_url, timeout=30)
                    with open(output_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"背景图已保存：{output_path}")
                    return True
        
        elif task_status == 'FAILED':
            print(f"任务失败：{status_result}")
            return False
    
    print("任务超时")
    return False


def add_text_overlay(image_path, title_cn, title_en, output_path):
    """叠加中英文标题"""
    img = Image.open(image_path).convert('RGBA')  # 转为 RGBA 模式
    width, height = img.size
    draw = ImageDraw.Draw(img)
    
    # 尝试加载字体（Windows 系统字体）
    try:
        # 中文书法字体
        font_cn = ImageFont.truetype("C:\\Windows\\Fonts\\simhei.ttf", 80)
        font_en = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 36)
    except:
        font_cn = ImageFont.load_default()
        font_en = ImageFont.load_default()
    
    # 计算文字位置（顶部 1/3 区域）
    text_area_height = height // 3
    margin = 60
    
    # 绘制半透明背景条（增强文字可读性）
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([0, 0, width, text_area_height], fill=(0, 0, 0, 128))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)
    
    # 绘制中文标题（金色）
    bbox_cn = draw.textbbox((0, 0), title_cn, font=font_cn)
    text_width_cn = bbox_cn[2] - bbox_cn[0]
    x_cn = (width - text_width_cn) // 2
    y_cn = margin
    
    # 金色描边效果
    for offset in [-2, 0, 2]:
        draw.text((x_cn + offset, y_cn), title_cn, font=font_cn, fill=(180, 140, 60))
    
    # 绘制英文副标题（浅金色）
    bbox_en = draw.textbbox((0, 0), title_en, font=font_en)
    text_width_en = bbox_en[2] - bbox_en[0]
    x_en = (width - text_width_en) // 2
    y_en = y_cn + 100
    
    draw.text((x_en, y_en), title_en, font=font_en, fill=(200, 180, 120))
    
    # 保存为 WEBP
    img_rgb = img.convert('RGB')
    img_rgb.save(output_path, 'WEBP', quality=95)
    print(f"封面图已保存：{output_path}")
    return True


if __name__ == "__main__":
    # 文章信息
    title_cn = "八字亲子兼容性"
    title_en = "BaZi Parent-Child Compatibility"

    # 背景图提示词（大师级构图，符合文章寓意——亲子关系，不是情侣！）
    background_prompt = """Masterpiece editorial photography, vertical 9:16 composition.

SUBJECT: A parent figure holding a small child's hand - the parent is clearly adult-sized, the child is clearly small (about half height). They stand side by side, not embracing. The parent gently guides the child forward. Both figures in elegant golden silhouette style.

BACKGROUND: Deep matte black with subtle texture of traditional Chinese rice paper. Soft golden light emanates from behind the figures, creating a halo effect.

COMPOSITION: Rule of thirds - figures positioned in lower two-thirds. Top third reserved for typography (will be added later). Generous negative space around figures.

STYLE: Premium luxury brand campaign aesthetic. Minimalist, elegant, museum-quality. Think Hermès meets Chinese contemporary art.

COLOR PALETTE: Matte black (#1a1a1a) + antique gold (#d4af37) + sparing vermillion accent (#c23616) as small seal stamp in lower right corner.

LIGHTING: Dramatic chiaroscuro lighting, golden rim light on figures, soft glow from connection point.

MOOD: Warm, protective, nurturing, harmonious.

PROHIBITED: NO 3D rendering, NO blur, NO fog, NO cartoon, NO emoji, NO busy patterns, NO text, NO letters, NO romantic couples, NO adult couples facing each other, NO embracing couples."""

    bg_path = "C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\images\\bazi-parent-child-bg.webp"
    output_path = "C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\images\\bazi-parent-child-compatibility-cover.webp"

    print("步骤 1: 生成背景图...")
    success = generate_background(background_prompt, bg_path)
    
    if success:
        print("步骤 2: 叠加中英文标题...")
        add_text_overlay(bg_path, title_cn, title_en, output_path)
        print("✅ 封面图生成完成")
    else:
        print("❌ 背景图生成失败")
