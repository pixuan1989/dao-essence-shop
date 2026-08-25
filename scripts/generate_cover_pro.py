"""
专业封面图生成脚本
使用更高级的排版方法
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import requests
import os

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


def add_professional_text(image_path, title_cn, title_en, output_path):
    """专业文字叠加"""
    # 打开背景图
    bg = Image.open(image_path).convert('RGB')
    width, height = bg.size
    
    # 创建文字层（RGBA，支持透明）
    text_layer = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)
    
    # 加载字体（使用系统字体）
    try:
        # 中文字体 - 使用更大的尺寸
        font_cn = ImageFont.truetype("C:\\Windows\\Fonts\\msyh.ttc", 72)  # 微软雅黑
        # 英文字体
        font_en = ImageFont.truetype("C:\\Windows\\Fonts\\georgia.ttf", 36)  # Georgia 衬线体
    except Exception as e:
        print(f"字体加载失败：{e}")
        font_cn = ImageFont.load_default()
        font_en = ImageFont.load_default()
    
    # 计算文字位置（精确居中）
    # 中文标题
    bbox_cn = draw.textbbox((0, 0), title_cn, font=font_cn)
    text_width_cn = bbox_cn[2] - bbox_cn[0]
    text_height_cn = bbox_cn[3] - bbox_cn[1]
    
    # 英文副标题
    bbox_en = draw.textbbox((0, 0), title_en, font=font_en)
    text_width_en = bbox_en[2] - bbox_en[0]
    text_height_en = bbox_en[3] - bbox_en[1]
    
    # 排版参数
    top_margin = int(height * 0.12)  # 顶部留白 12%
    spacing = 15  # 中英文间距
    
    # 计算居中位置
    x_cn = (width - text_width_cn) // 2
    y_cn = top_margin
    
    x_en = (width - text_width_en) // 2
    y_en = y_cn + text_height_cn + spacing
    
    # 绘制文字阴影（增加可读性）
    shadow_offset = 3
    shadow_color = (0, 0, 0, 100)  # 半透明黑色
    
    # 中文阴影
    draw.text((x_cn + shadow_offset, y_cn + shadow_offset), title_cn, font=font_cn, fill=shadow_color)
    # 英文阴影
    draw.text((x_en + shadow_offset, y_en + shadow_offset), title_en, font=font_en, fill=shadow_color)
    
    # 绘制文字主体（金色）
    text_color_cn = (255, 215, 100, 255)  # 金色
    text_color_en = (220, 200, 150, 255)  # 浅金色
    
    draw.text((x_cn, y_cn), title_cn, font=font_cn, fill=text_color_cn)
    draw.text((x_en, y_en), title_en, font=font_en, fill=text_color_en)
    
    # 合并背景图和文字层
    final = Image.alpha_composite(bg.convert('RGBA'), text_layer)
    
    # 保存
    final_rgb = final.convert('RGB')
    final_rgb.save(output_path, 'WEBP', quality=95)
    print(f"封面图已保存：{output_path}")
    return True


if __name__ == "__main__":
    # 文章信息
    title_cn = "为什么你和孩子总是冲突？"
    title_en = "The Hidden Energy Pattern Between You and Your Child"
    
    # 背景图提示词（温暖、自然、真实）
    background_prompt = """Warm, intimate family photography, vertical 9:16.

SUBJECT: A parent and young child sharing a genuine moment - the parent is kneeling or sitting at the child's level, both looking at something together with curiosity and wonder. Natural, unposed, authentic emotion.

STYLE: Kinfolk magazine aesthetic. Ultra-clean composition, lots of negative space, natural lighting, soft color palette. Think warm family moments captured by a professional photographer.

COLOR PALETTE: Warm cream and beige tones (#f5f1e8, #e8dcc8) + soft golden hour light + minimal warm accents.

COMPOSITION: Subjects in lower third of frame, massive negative space in upper two-thirds for typography. Rule of thirds applied.

MOOD: Warm, nurturing, hopeful, authentic, peaceful.

LIGHTING: Soft natural light, golden hour warmth, gentle shadows.

PROHIBITED: NO 3D rendering, NO cartoon, NO emoji, NO dark/gothic, NO dramatic lighting, NO black background, NO gold foil, NO calligraphy, NO staging, NO posing."""

    bg_path = "C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\images\\bazi-parent-child-bg.webp"
    output_path = "C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\images\\bazi-parent-child-compatibility-cover.webp"
    
    print("步骤 1: 生成背景图...")
    success = generate_background(background_prompt, bg_path)
    
    if success:
        print("步骤 2: 叠加专业文字...")
        add_professional_text(bg_path, title_cn, title_en, output_path)
        print("✅ 封面图生成完成")
    else:
        print("❌ 背景图生成失败")
