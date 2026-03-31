#!/usr/bin/env python3
"""
压缩图片脚本
将大图片压缩到适合网页使用的大小
"""

from PIL import Image
import os

IMAGES_DIR = "images"

# 需要压缩的图片配置
# 格式: (文件名, 最大宽度, 质量)
IMAGES_TO_COMPRESS = [
    ("3.jpg", 1200, 85),      # 16MB -> 目标 <200KB
    ("111.png", 400, 85),     # 1.4MB -> 目标 <50KB
    ("222.png", 400, 85),     # 1.5MB -> 目标 <50KB
    ("333.png", 400, 85),     # 2MB -> 目标 <50KB
    ("444.png", 400, 85),     # 1.6MB -> 目标 <50KB
]

def compress_image(filename, max_width, quality):
    """压缩单个图片"""
    filepath = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(filepath):
        print(f"❌ 文件不存在: {filename}")
        return
    
    # 获取原始大小
    original_size = os.path.getsize(filepath)
    print(f"\n处理: {filename}")
    print(f"  原始大小: {original_size / 1024:.1f} KB")
    
    try:
        # 打开图片
        with Image.open(filepath) as img:
            # 转换为RGB（处理PNG透明通道）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # 等比例缩放
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_height = int(height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                print(f"  缩放: {width}x{height} -> {max_width}x{new_height}")
            
            # 保存为JPEG（更好的压缩率）
            output_filename = os.path.splitext(filename)[0] + "_compressed.jpg"
            output_path = os.path.join(IMAGES_DIR, output_filename)
            
            img.save(output_path, "JPEG", quality=quality, optimize=True)
            
            new_size = os.path.getsize(output_path)
            reduction = (1 - new_size / original_size) * 100
            print(f"  压缩后: {new_size / 1024:.1f} KB")
            print(f"  减少: {reduction:.1f}%")
            print(f"  输出: {output_filename}")
            
            return output_filename
            
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        return None

def main():
    print("=" * 50)
    print("图片压缩工具")
    print("=" * 50)
    
    compressed_files = []
    
    for filename, max_width, quality in IMAGES_TO_COMPRESS:
        result = compress_image(filename, max_width, quality)
        if result:
            compressed_files.append((filename, result))
    
    print("\n" + "=" * 50)
    print("压缩完成!")
    print("=" * 50)
    print("\n需要手动替换HTML中的图片引用:")
    for original, compressed in compressed_files:
        print(f"  {original} -> {compressed}")
    
    print("\n或者运行 replace_images.py 自动替换")

if __name__ == "__main__":
    main()
