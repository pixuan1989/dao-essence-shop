#!/bin/bash
# 验证代码中是否包含 Stripe 密钥

echo "🔍 正在检查代码中的敏感信息..."

# 检查完整的密钥
FULL_PRIVATE_KEY="sk_test_51TCXN018te51GWiewKqP8Rp8reBZP8oL4WCxngJPliUJKjHbRbRIgpqeEnZ67XylRnLfNvC09I0FXSYhDZo5hsDx00ofI4i5z6"
FULL_PUBLIC_KEY="pk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV"

echo ""
echo "检查完整的密钥..."

if grep -r "$FULL_PRIVATE_KEY" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=orders . ; then
    echo "❌ 警告：发现完整的 Stripe 私钥！"
    exit 1
else
    echo "✅ 未发现完整的 Stripe 私钥"
fi

if grep -r "$FULL_PUBLIC_KEY" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=orders . ; then
    echo "❌ 警告：发现完整的 Stripe 公钥！"
    exit 1
else
    echo "✅ 未发现完整的 Stripe 公钥"
fi

echo ""
echo "检查占位符..."

# 允许的占位符
if grep -r "sk_test\.\.\." --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=orders . | grep -v "STRIPE_SECRET_KEY=sk_test\.\.\."; then
    echo "⚠️  发现 sk_test_... 占位符（这是正常的）"
fi

if grep -r "pk_test\.\.\." --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=orders . | grep -v "STRIPE_PUBLIC_KEY=pk_test\.\.\."; then
    echo "⚠️  发现 pk_test_... 占位符（这是正常的）"
fi

echo ""
echo "检查 .gitignore..."

if grep "\.env" .gitignore > /dev/null; then
    echo "✅ .env 文件已在 .gitignore 中"
else
    echo "❌ 警告：.env 文件不在 .gitignore 中！"
    exit 1
fi

echo ""
echo "🎉 所有检查通过！代码可以安全提交。"
