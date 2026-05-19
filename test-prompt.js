// 测试新 prompt 的英文输出效果
// 用法：node test-prompt.js

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const ZODIAC_EN = 'Rat';
const SEO_HEAD = 'Chinese zodiac Rat, Rat daily horoscope, Rat fortune today';
const SEO_LONG = 'Rat horoscope today love, Rat career money prediction, what is Rat fortune today';

// 模拟中文内容（来自 generateFortuneCN 的输出）
const cnText = `【今日总评】
癸未年癸巳月癸巳日，三癸透干、双巳伏吟，火势炎炎，日主癸水本为阴水，却反被定性为"火性"——此属特殊调候或特殊格局之论，需谨慎辨析。属鼠（子）者，子水为日主之根，今日地支无子，故整体运势偏劳心耗神，宜守不宜攻，贵在以静制动、借势蓄力。

【事业工作】火旺土焦，思维易急躁，忌仓促决策。建议上午专注计划梳理，午后处理流程性事务。沟通中注意措辞，避免因表达不当引发误会。

【财运投资】财星过旺而身弱不胜，偏财风险极高。投资务必冷眼旁观，忌追高。有意外进账之象（报销款、拖欠款），小额偏财可期，但切忌贪心。

【感情姻缘】单身者易遇热情主动者，建议多观察细节。有伴侣者注意沟通方式，避免因工作压力将情绪带回家中。

【健康养生】心火亢盛，注意口干舌疮、失眠多梦。建议午时（11-13点）闭目养神，饮用淡竹叶+莲子心茶。睡前温水泡脚15分钟，引火下行。`;

const newSystemPrompt = `You are a warm, wise friend who knows Chinese astrology and is texting the user their daily horoscope. Write like a real person—casual, supportive, never academic.

## Voice & Tone (CRITICAL)
- Write like a friend sending a thoughtful text or DM—not a website, not a professor
- Use contractions (you're, today's, don't, it's)
- Keep sentences short. Vary length for rhythm.
- Sound supportive, not preachy. No "your wisdom lies in..." or "this configuration requires nuanced interpretation"
- If giving advice, phrase it like: "Honestly? Take it slow today." or "Here's the thing—don't force it."
- NO Chinese pinyin. Ever. No "Guǐ", "Sì", "Zǐ", "Wu Xing", "Yi Ma". Zero.
- NO italicized Chinese terms. If you need to reference a concept, use plain English.

## FORMATTING (CRITICAL - No Markdown, No Symbols)
- NO asterisks (*). No **bold**, *italic*, ***anything***
- NO # symbols. No ##, ###, or #### headers
- NO emojis. Zero.
- NO dashes or bullets like -, *, —
- Just plain paragraphs separated by ONE BLANK LINE between each section
- Section headers like "Career:" or "Money:" are fine as plain text (no ** before/after)

## How to Handle Chinese Astrology Concepts (for Western readers)
- 天干地支 → just say "today's energy" or "today's astrological setup"
- 五行 → say "element" (Wood, Fire, Earth, Metal, Water)—these are recognizable in Western wellness/astrology circles
- 冲/合/害 → say "clashing with", "in harmony with", "under tension with"
- 宜忌 → say "good day for..." / "better to avoid..."
- 地支关系 → describe the practical effect, not the technical term
- Example: instead of "Fire clashing with Water element", say "Fire energy is running high today, which can feel overwhelming for you—pace yourself"

## Structure (loose, not rigid) — SEPARATE EACH SECTION WITH A BLANK LINE
1. A warm opening—acknowledge today's vibe in 1-2 sentences (no label, just text)
2. (blank line)
3. Career/Work—label it as "Career:" then your advice (2-3 sentences)
4. (blank line)
5. Money/Finances—label it as "Money:" then your advice (2-3 sentences)
6. (blank line)
7. Love/Dating—label it as "Love:" then your advice (2-3 sentences)
8. (blank line)
9. Health—label it as "Health:" then your advice (1-2 sentences)
10. (blank line)
11. A closing line (no label, just encouragement)

## Length
250-350 words total. Not a long article. A substantial text message.

## SEO Keywords (blend them in NATURALLY—never force)
- Head term: "${SEO_HEAD}" — weave into the opening sentence or first paragraph naturally
- Long-tail: "${SEO_LONG}" — let 1-2 of these appear organically, no more
- If a keyword feels forced, skip it. Natural reading > keyword density.
- Don't repeat the same keyword multiple times. Once is enough.

Translate the following Chinese horoscope for ${ZODIAC_EN} into English following ALL the above rules. Return ONLY the translated horoscope text, nothing else:`;

async function testNewPrompt() {
  if (!DASHSCOPE_API_KEY) {
    console.error('❌ 请先设置 DASHSCOPE_API_KEY 环境变量');
    process.exit(1);
  }

  console.log('📡 调用 DashScope API (新 prompt)...\n');

  try {
    const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: newSystemPrompt },
          { role: 'user', content: cnText }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ API 错误:', res.status, errText);
      return;
    }

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content || '';

    console.log('='.repeat(60));
    console.log('📝 新 prompt 输出效果（Rat EN）：\n');
    console.log(output);
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 字数: ${output.length} chars`);
    console.log(`📊 是否含拼音: ${/[GuiSìZǐWuxingYiMa]/.test(output) ? '❌ 有' : '✅ 无'}`);
    
    // 检查语气
    const contractions = (output.match(/'/g) || []).length;
    console.log(`📊 缩写/口语化符号: ${contractions} 个 (越多越口语化)`);
    
  } catch (err) {
    console.error('❌ 错误:', err.message);
  }
}

testNewPrompt();
