// 测试翻译 API
import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/DASHSCOPE_API_KEY=(.+)/);
const API_KEY = keyMatch ? keyMatch[1].trim() : null;

console.log('API Key 存在:', !!API_KEY);
console.log('Key 前20位:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'N/A');

const testText = '鼠今日运势走低，不利因素较多，做事容易事倍功半。';

async function translate(text, targetLang = 'English') {
  const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: `Translate the following Chinese text to ${targetLang}. Only output the translation, no explanations.` },
        { role: 'user', content: text }
      ]
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || JSON.stringify(data);
}

if (API_KEY) {
  console.log('\n测试翻译...');
  const result = await translate(testText);
  console.log('原文:', testText);
  console.log('译文:', result);
} else {
  console.log('❌ 需要设置 DASHSCOPE_API_KEY');
}
