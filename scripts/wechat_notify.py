"""
DaoEssence 微信推送脚本
支持多种微信推送服务：企业微信机器人、Server 酱、PushPlus 等
"""

import requests
import json
import os
import sys
from datetime import datetime
from pathlib import Path


# 推送服务配置（从环境变量或配置文件读取）
def get_config():
    """获取推送配置：优先用环境变量（GitHub Actions 注入 WECOM_WEBHOOK），无则回退本地 json"""
    config_file = os.path.join(os.path.dirname(__file__), 'wechat_config.json')

    # 优先使用环境变量（GitHub Secrets 通过 workflow 注入到 WECOM_WEBHOOK）
    env_webhook = os.environ.get('WECOM_WEBHOOK')
    if env_webhook:
        return {"service": "wecom", "wecom_webhook": env_webhook}

    if os.path.exists(config_file):
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 默认配置（需要用户填写）
    return {
        "service": "serverchan",  # 可选：serverchan, pushplus, wecom
        "serverchan_key": "",  # Server 酱 SendKey
        "pushplus_token": "",  # PushPlus token
        "wecom_webhook": "",  # 企业微信机器人 webhook
    }


def send_via_serverchan(sendkey, title, content):
    """Server 酱推送"""
    url = f"https://sctapi.ftqq.com/{sendkey}.send"
    data = {
        "title": title,
        "desp": content
    }
    response = requests.post(url, data=data, timeout=10)
    return response.json()


def send_via_pushplus(token, title, content):
    """PushPlus 推送"""
    url = "http://www.pushplus.plus/send"
    data = {
        "token": token,
        "title": title,
        "content": content,
        "template": "markdown"
    }
    response = requests.post(url, json=data, timeout=10)
    return response.json()


def send_via_wecom(webhook, content):
    """企业微信机器人推送（支持 Markdown）"""
    # 企业微信 Markdown 格式
    data = {
        "msgtype": "markdown",
        "markdown": {
            "content": content
        }
    }
    response = requests.post(webhook, json=data, timeout=10)
    return response.json()


def find_latest_candidates():
    """找最新的候选选题文件"""
    topic_dir = os.path.join(os.path.dirname(__file__), '..', 'topic_data')
    json_files = sorted(Path(topic_dir).glob('candidates_*.json'), reverse=True)
    
    if not json_files:
        return None
    
    with open(json_files[0], 'r', encoding='utf-8') as f:
        return json.load(f)


def find_latest_wechat_msg():
    """找最新的微信推送格式文件"""
    topic_dir = os.path.join(os.path.dirname(__file__), '..', 'topic_data')
    txt_files = sorted(Path(topic_dir).glob('wechat_*.txt'), reverse=True)
    
    if not txt_files:
        return None
    
    with open(txt_files[0], 'r', encoding='utf-8') as f:
        return f.read()


def main():
    print("准备推送选题...")
    
    # 加载配置
    config = get_config()
    
    # 检查配置
    if config['service'] == 'serverchan' and not config.get('serverchan_key'):
        print("❌ 未配置 Server 酱 SendKey")
        print("请在 scripts/wechat_config.json 中填写 serverchan_key")
        print("获取方式：https://sct.ftqq.com/")
        return
    
    if config['service'] == 'pushplus' and not config.get('pushplus_token'):
        print("❌ 未配置 PushPlus token")
        print("请在 scripts/wechat_config.json 中填写 pushplus_token")
        print("获取方式：http://www.pushplus.plus/")
        return
    
    if config['service'] == 'wecom' and not config.get('wecom_webhook'):
        print("❌ 未配置企业微信机器人 webhook")
        print("请在 scripts/wechat_config.json 中填写 wecom_webhook")
        return
    
    # 加载选题
    candidates = find_latest_candidates()
    if not candidates:
        print(" 未找到候选选题，请先运行 topic_generator.py")
        return
    
    # 加载微信推送格式
    wechat_msg = find_latest_wechat_msg()
    if not wechat_msg:
        print("❌ 未找到微信推送格式，请先运行 topic_generator.py")
        return
    
    # 推送
    title = f"【DaoEssence 选题推荐】{datetime.now().strftime('%Y-%m-%d')}"
    
    print(f"使用推送服务：{config['service']}")
    
    if config['service'] == 'serverchan':
        result = send_via_serverchan(config['serverchan_key'], title, wechat_msg)
        print(f"推送结果：{result}")
    
    elif config['service'] == 'pushplus':
        result = send_via_pushplus(config['pushplus_token'], title, wechat_msg)
        print(f"推送结果：{result}")
    
    elif config['service'] == 'wecom':
        result = send_via_wecom(config['wecom_webhook'], wechat_msg)
        print(f"推送结果：{result}")
        if result.get('errcode', -1) != 0:
            print("❌ 企业微信推送失败（errcode != 0），以非零退出码终止")
            sys.exit(1)
    
    print("\n✅ 推送完成！等待用户回复...")


if __name__ == "__main__":
    main()
