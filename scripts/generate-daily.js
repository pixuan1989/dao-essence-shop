/**
 * 生肖每日运势生成器 v3.0 [2026-05-19]
 * 功能：基于天干地支五行计算，生成每日12生肖运势
 * v3.0: 新增12个静态详情页（永久URL + 嵌入数据 + canonical/hreflang SEO优化）
 * 用法：node scripts/generate-daily.js [日期 YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// ─── 加载排盘引擎 ───
const paipanHelperPath = path.join(__dirname, 'paipan-helper.cjs');
const { getDailyFourPillars } = require(paipanHelperPath);

// ─── 加载 .env.local（用于本地开发时读取 API Key）───
const ENV_FILE = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

// ─── 路径配置 ───
const PROJECT_ROOT = path.join(__dirname, '..');
const SEO_DIR = path.join(PROJECT_ROOT, 'zodiac', 'seo-content');
const DATA_FILE = path.join(PROJECT_ROOT, 'zodiac', 'js', 'zodiac-data.js');
// 兼容 ES Module __dirname

// ─── 生肖列表 ───
const ZODIAC_LIST = [
  { key: 'rat',     name: '鼠', sign: '子', en: 'Rat', element: '水' },
  { key: 'ox',      name: '牛', sign: '丑', en: 'Ox', element: '土' },
  { key: 'tiger',   name: '虎', sign: '寅', en: 'Tiger', element: '木' },
  { key: 'rabbit',  name: '兔', sign: '卯', en: 'Rabbit', element: '木' },
  { key: 'dragon',  name: '龙', sign: '辰', en: 'Dragon', element: '土' },
  { key: 'snake',   name: '蛇', sign: '巳', en: 'Snake', element: '火' },
  { key: 'horse',   name: '马', sign: '午', en: 'Horse', element: '火' },
  { key: 'goat',    name: '羊', sign: '未', en: 'Goat', element: '土' },
  { key: 'monkey',  name: '猴', sign: '申', en: 'Monkey', element: '金' },
  { key: 'rooster', name: '鸡', sign: '酉', en: 'Rooster', element: '金' },
  { key: 'dog',     name: '狗', sign: '戌', en: 'Dog', element: '土' },
  { key: 'pig',     name: '猪', sign: '亥', en: 'Pig', element: '水' },
];

// ─── 博客导流推荐（12生肖 × 2篇，按语义匹配）───
// 每条包含 slug + 中文标题 + 英文标题，generate-daily.js 按需输出对应语言版本
const BLOG_RECOMMENDATIONS = {
  rat:     [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                         titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
  ox:      [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  tiger:   [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-home-office-7-rules',            titleCN: '居家辦公風水：7條實用規則',                          titleEN: 'Feng Shui Home Office: 7 Rules' },
  ],
  rabbit:  [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  dragon:  [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
  ],
  snake:   [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
  horse:   [
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  goat:    [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  monkey:  [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-home-office-7-rules',            titleCN: '居家辦公風水：7條實用規則',                          titleEN: 'Feng Shui Home Office: 7 Rules' },
  ],
  rooster: [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  dog:     [
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  pig:     [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
};

// ─── 生肖百科（Evergreen Content，永远不变，用于 SEO 锚定）───
const ZODIAC_EVERGREEN = {
  rat: {
    en: `<h2>Rat Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Rat (鼠) is the first sign of the Chinese zodiac. People born in the Year of the Rat are known for their intelligence, quick wit, and resourcefulness. In Chinese culture, the Rat symbolizes wealth, surplus, and prosperity.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Rat</strong>: 2020, 2008, 1996, 1984, 1972, 1960, 1948, 1936, 1924.</p>
<h3>Rat Personality Traits</h3>
<p>Rat individuals are clever, adaptable, and excellent problem-solvers. They have a natural ability to spot opportunities and make the most of any situation. Rats are social and charming, with a keen sense of humor that makes them popular in any group.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Rat is associated with the Water element. Lucky colors include blue, gold, and green. Lucky numbers are 2, 3, and numbers containing 6. The Rat's compatible signs are Ox, Dragon, and Monkey, while the Horse is considered the least compatible.</p>
<h3>Rat in Love &amp; Relationships</h3>
<p>In relationships, Rats are devoted, generous, and highly attentive to their partner's needs. They value family above all else and will work tirelessly to ensure their loved ones are happy and secure.</p>`,
    zh: `<h2>生肖鼠 — 性格、运势与特质详解</h2>
<p>鼠是十二生肖中的第一位。属鼠的人以聪明、机智和足智多谋著称。在中国文化中，鼠象征着财富、富余和繁荣。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>鼠</strong>：2020、2008、1996、1984、1972、1960、1948、1936、1924。</p>
<h3>属鼠人的性格特点</h3>
<p>属鼠的人聪明、适应力强，是出色的问题解决者。他们天生具有发现机会并充分利用任何情况的能力。鼠善于社交且富有魅力，具有敏锐的幽默感，使他们在任何群体中都受欢迎。</p>
<h3>五行与幸运元素</h3>
<p>鼠在五行中属水。幸运颜色为蓝色、金色和绿色。幸运数字是 2、3 和含 6 的数字。鼠的六合生肖是牛、龙和猴，而马被认为是最不配的生肖。</p>
<h3>属鼠人的爱情与人际关系</h3>
<p>在感情方面，属鼠的人忠诚、慷慨且对伴侣的需求高度关注。他们最重视家庭，会不懈努力确保所爱之人幸福安康。</p>`
  },
  ox: {
    en: `<h2>Ox Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Ox (牛) is the second sign of the Chinese zodiac. People born in the Year of the Ox are known for their diligence, dependability, and strength. In Chinese culture, the Ox symbolizes hard work, honesty, and perseverance.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Ox</strong>: 2021, 2009, 1997, 1985, 1973, 1961, 1949, 1937, 1925.</p>
<h3>Ox Personality Traits</h3>
<p>Ox individuals are patient, methodical, and incredibly hardworking. They believe in steady progress and are willing to put in the effort to achieve their goals. Oxes are known for their integrity and strong sense of responsibility, making them trusted colleagues and reliable friends.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Ox is associated with the Earth element. Lucky colors include white, yellow, and green. Lucky numbers are 1, 4, and numbers containing 9. The Ox's compatible signs are Rat, Snake, and Rooster, while the Goat is considered the least compatible.</p>
<h3>Ox in Love &amp; Relationships</h3>
<p>In relationships, Oxes are loyal, devoted, and protective. They may not be the most romantic, but they express love through actions and commitment. Oxes value stability and long-term partnership above all else.</p>`,
    zh: `<h2>生肖牛 — 性格、运势与特质详解</h2>
<p>牛是十二生肖中的第二位。属牛的人以勤奋、可靠和坚韧著称。在中国文化中，牛象征着勤劳、诚实和毅力。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>牛</strong>：2021、2009、1997、1985、1973、1961、1949、1937、1925。</p>
<h3>属牛人的性格特点</h3>
<p>属牛的人耐心、有条理、极其勤奋。他们相信稳步前进，愿意为实现目标付出努力。属牛的人以诚信和强烈的责任感著称，是值得信赖的同事和可靠的朋友。</p>
<h3>五行与幸运元素</h3>
<p>牛在五行中属土。幸运颜色为白色、黄色和绿色。幸运数字是 1、4 和含 9 的数字。牛的六合生肖是鼠、蛇和鸡，而羊被认为是最不配的生肖。</p>
<h3>属牛人的爱情与人际关系</h3>
<p>在感情方面，属牛的人忠诚、专一且保护欲强。他们可能不是最浪漫的，但会通过行动和承诺来表达爱意。属牛的人最看重稳定性和长期的伴侣关系。</p>`
  },
  tiger: {
    en: `<h2>Tiger Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Tiger (虎) is the third sign of the Chinese zodiac. People born in the Year of the Tiger are known for their courage, competitiveness, and confidence. In Chinese culture, the Tiger symbolizes power, bravery, and royalty.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Tiger</strong>: 2022, 2010, 1998, 1986, 1974, 1962, 1950, 1938, 1926.</p>
<h3>Tiger Personality Traits</h3>
<p>Tiger individuals are natural leaders with a strong sense of justice. They are adventurous, independent, and unafraid to take risks. Tigers have a magnetic personality that inspires others, and they thrive in challenging environments where they can showcase their abilities.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Tiger is associated with the Wood element. Lucky colors include blue, grey, and orange. Lucky numbers are 1, 3, and 4. The Tiger's compatible signs are Horse, Dog, and Pig, while the Monkey is considered the least compatible.</p>
<h3>Tiger in Love &amp; Relationships</h3>
<p>In relationships, Tigers are passionate, protective, and generous. They love grand gestures and enjoy keeping the spark alive. Tigers need a partner who can match their energy and appreciate their adventurous spirit.</p>`,
    zh: `<h2>生肖虎 — 性格、运势与特质详解</h2>
<p>虎是十二生肖中的第三位。属虎的人以勇气、竞争力和自信著称。在中国文化中，虎象征着力量、勇敢和王权。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>虎</strong>：2022、2010、1998、1986、1974、1962、1950、1938、1926。</p>
<h3>属虎人的性格特点</h3>
<p>属虎的人是天生的领导者，具有强烈的正义感。他们冒险、独立、不怕风险。虎具有磁性的人格魅力，能激励他人，在充满挑战的环境中茁壮成长。</p>
<h3>五行与幸运元素</h3>
<p>虎在五行中属木。幸运颜色为蓝色、灰色和橙色。幸运数字是 1、3 和 4。虎的六合生肖是马、狗和猪，而猴被认为是最不配的生肖。</p>
<h3>属虎人的爱情与人际关系</h3>
<p>在感情方面，属虎的人热情、保护欲强且大方。他们喜欢浪漫的举动，享受保持激情的火花。虎需要一个能匹配他们能量并欣赏他们冒险精神的伴侣。</p>`
  },
  rabbit: {
    en: `<h2>Rabbit Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Rabbit (兔) is the fourth sign of the Chinese zodiac. People born in the Year of the Rabbit are known for their gentleness, elegance, and compassion. In Chinese culture, the Rabbit symbolizes longevity, peace, and prosperity.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Rabbit</strong>: 2023, 2011, 1999, 1987, 1975, 1963, 1951, 1939, 1927.</p>
<h3>Rabbit Personality Traits</h3>
<p>Rabbit individuals are diplomatic, refined, and deeply empathetic. They have a natural ability to create harmony in their surroundings and avoid conflict whenever possible. Rabbits are artistic, creative, and have excellent taste in all aspects of life.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Rabbit is associated with the Wood element. Lucky colors include red, pink, purple, and blue. Lucky numbers are 3, 4, and 6. The Rabbit's compatible signs are Goat, Pig, and Dog, while the Rooster is considered the least compatible.</p>
<h3>Rabbit in Love &amp; Relationships</h3>
<p>In relationships, Rabbits are tender, caring, and attentive. They create a warm and loving home environment and are deeply devoted to their partners. Rabbits value emotional security and seek partners who appreciate their gentle nature.</p>`,
    zh: `<h2>生肖兔 — 性格、运势与特质详解</h2>
<p>兔是十二生肖中的第四位。属兔的人以温和、优雅和同情心著称。在中国文化中，兔象征着长寿、和平与繁荣。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>兔</strong>：2023、2011、1999、1987、1975、1963、1951、1939、1927。</p>
<h3>属兔人的性格特点</h3>
<p>属兔的人善于外交、优雅且极具同理心。他们天生有能力在周围创造和谐，并尽可能避免冲突。属兔的人具有艺术天赋、创造力，在生活的各个方面都有出色的品味。</p>
<h3>五行与幸运元素</h3>
<p>兔在五行中属木。幸运颜色为红色、粉色、紫色和蓝色。幸运数字是 3、4 和 6。兔的六合生肖是羊、猪和狗，而鸡被认为是最不配的生肖。</p>
<h3>属兔人的爱情与人际关系</h3>
<p>在感情方面，属兔的人温柔、体贴且细心。他们创造温暖 loving 的家庭环境，对伴侣 deeply devoted。属兔的人重视情感安全感，寻找能欣赏他们温柔天性的伴侣。</p>`
  },
  dragon: {
    en: `<h2>Dragon Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Dragon (龙) is the fifth sign of the Chinese zodiac and the only mythical creature. People born in the Year of the Dragon are known for their charisma, ambition, and vitality. In Chinese culture, the Dragon symbolizes power, excellence, and good fortune.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Dragon</strong>: 2024, 2012, 2000, 1988, 1976, 1964, 1952, 1940, 1928.</p>
<h3>Dragon Personality Traits</h3>
<p>Dragon individuals are energetic, confident, and naturally charismatic. They are ambitious achievers who set high standards for themselves and others. Dragons are innovative thinkers who thrive in leadership roles and are not afraid to challenge the status quo.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Dragon is associated with the Earth element. Lucky colors include gold, silver, and hoary. Lucky numbers are 1, 6, and 7. The Dragon's compatible signs are Rat, Monkey, and Rooster, while the Dog is considered the least compatible.</p>
<h3>Dragon in Love &amp; Relationships</h3>
<p>In relationships, Dragons are passionate, generous, and protective. They expect their partners to be equally driven and ambitious. Dragons value loyalty and seek relationships that elevate both partners to new heights.</p>`,
    zh: `<h2>生肖龙 — 性格、运势与特质详解</h2>
<p>龙是十二生肖中的第五位，也是唯一的神话生物。属龙的人以魅力、雄心和活力著称。在中国文化中，龙象征着力量、卓越和好运。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>龙</strong>：2024、2012、2000、1988、1976、1964、1952、1940、1928。</p>
<h3>属龙人的性格特点</h3>
<p>属龙的人精力充沛、自信且天生具有魅力。他们是雄心勃勃的成就者，对自己和他人都有高标准。属龙的人是创新思想家，在领导角色中茁壮成长，不怕挑战现状。</p>
<h3>五行与幸运元素</h3>
<p>龙在五行中属土。幸运颜色为金色、银色和灰白色。幸运数字是 1、6 和 7。龙的六合生肖是鼠、猴和鸡，而狗被认为是最不配的生肖。</p>
<h3>属龙人的爱情与人际关系</h3>
<p>在感情方面，属龙的人热情、大方且保护欲强。他们期望伴侣同样有驱动力和雄心。龙重视忠诚，寻找能让双方都提升到新高度的关系。</p>`
  },
  snake: {
    en: `<h2>Snake Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Snake (蛇) is the sixth sign of the Chinese zodiac. People born in the Year of the Snake are known for their wisdom, intuition, and elegance. In Chinese culture, the Snake symbolizes mystery, grace, and deep thinking.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Snake</strong>: 2025, 2013, 2001, 1989, 1977, 1965, 1953, 1941, 1929.</p>
<h3>Snake Personality Traits</h3>
<p>Snake individuals are calm, collected, and analytical. They possess a natural charm that draws others to them, yet they value their privacy. Snakes are excellent planners and strategists, making them natural problem-solvers who think several steps ahead.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Snake is associated with the Fire element. Lucky colors include red, black, and gold. Lucky numbers are 2, 8, and 9. The Snake's compatible signs are Ox, Rooster, and Monkey, while the Pig is considered the least compatible.</p>
<h3>Snake in Love &amp; Relationships</h3>
<p>In relationships, Snakes are loyal, passionate, and deeply committed. They may appear reserved at first, but once they trust someone, they give their whole heart. Snakes value emotional depth and intellectual connection.</p>`,
    zh: `<h2>生肖蛇 — 性格、运势与特质详解</h2>
<p>蛇是十二生肖中的第六位。属蛇的人以智慧、直觉力和优雅著称。在中国文化中，蛇象征着神秘、优雅和深邃的思考。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>蛇</strong>：2025、2013、2001、1989、1977、1965、1953、1941、1929。</p>
<h3>属蛇人的性格特点</h3>
<p>属蛇的人冷静、沉着、善于分析。他们天生具有吸引力，但注重隐私。属蛇的人是出色的规划者和策略家，是天然的问题解决者，总是领先几步思考。</p>
<h3>五行与幸运元素</h3>
<p>蛇在五行中属火。幸运颜色为红色、黑色和金色。幸运数字是 2、8 和 9。蛇的六合生肖是牛、鸡和猴，而猪被认为是最不配的生肖。</p>
<h3>属蛇人的爱情与人际关系</h3>
<p>在感情方面，属蛇的人忠诚、热情且全心投入。他们可能起初显得矜持，但一旦信任对方，便会全心付出。蛇重视情感深度和精神契合。</p>`
  },
  horse: {
    en: `<h2>Horse Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Horse (马) is the seventh sign of the Chinese zodiac. People born in the Year of the Horse are known for their energy, enthusiasm, and independence. In Chinese culture, the Horse symbolizes freedom, speed, and noble spirit.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Horse</strong>: 2026, 2014, 2002, 1990, 1978, 1966, 1954, 1942, 1930.</p>
<h3>Horse Personality Traits</h3>
<p>Horse individuals are animated, active, and energetic. They love being in the spotlight and have a natural ability to inspire others. Horses are independent thinkers who value their freedom and resist being tied down by routines or restrictions.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Horse is associated with the Fire element. Lucky colors include yellow, green, and purple. Lucky numbers are 2, 3, and 7. The Horse's compatible signs are Tiger, Dog, and Goat, while the Rat is considered the least compatible.</p>
<h3>Horse in Love &amp; Relationships</h3>
<p>In relationships, Horses are passionate, adventurous, and generous. They need a partner who respects their need for independence while sharing their love of excitement. Horses are loyal but require space to breathe and explore.</p>`,
    zh: `<h2>生肖马 — 性格、运势与特质详解</h2>
<p>马是十二生肖中的第七位。属马的人以活力、热情和独立著称。在中国文化中，马象征着自由、速度和高贵的精神。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>马</strong>：2026、2014、2002、1990、1978、1966、1954、1942、1930。</p>
<h3>属马人的性格特点</h3>
<p>属马的人活泼、积极且精力充沛。他们喜欢成为焦点，天生具有激励他人的能力。马是独立思考者，重视自由，抗拒被常规或限制束缚。</p>
<h3>五行与幸运元素</h3>
<p>马在五行中属火。幸运颜色为黄色、绿色和紫色。幸运数字是 2、3 和 7。马的六合生肖是虎、狗和羊，而鼠被认为是最不配的生肖。</p>
<h3>属马人的爱情与人际关系</h3>
<p>在感情方面，属马的人热情、冒险且大方。他们需要一个尊重他们独立需求、同时分享他们对兴奋热爱的伴侣。马是忠诚的，但需要空间呼吸和探索。</p>`
  },
  goat: {
    en: `<h2>Goat Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Goat (羊) is the eighth sign of the Chinese zodiac. People born in the Year of the Goat are known for their gentleness, creativity, and compassion. In Chinese culture, the Goat symbolizes harmony, artistry, and filial piety.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Goat</strong>: 2027, 2015, 2003, 1991, 1979, 1967, 1955, 1943, 1931.</p>
<h3>Goat Personality Traits</h3>
<p>Goat individuals are mild-mannered, creative, and deeply empathetic. They have a strong appreciation for beauty and the arts, and they strive to create harmony in all areas of their lives. Goats are generous and always willing to help those in need.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Goat is associated with the Earth element. Lucky colors include green, red, and purple. Lucky numbers are 2, 7, and 8. The Goat's compatible signs are Rabbit, Horse, and Pig, while the Ox is considered the least compatible.</p>
<h3>Goat in Love &amp; Relationships</h3>
<p>In relationships, Goats are caring, nurturing, and deeply romantic. They create a warm and loving home and are devoted partners who prioritize their loved ones' happiness above all else.</p>`,
    zh: `<h2>生肖羊 — 性格、运势与特质详解</h2>
<p>羊是十二生肖中的第八位。属羊的人以温和、创造力和同情心著称。在中国文化中，羊象征着和谐、艺术和孝顺。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>羊</strong>：2027、2015、2003、1991、1979、1967、1955、1943、1931。</p>
<h3>属羊人的性格特点</h3>
<p>属羊的人温文尔雅、富有创造力且极具同理心。他们对美和艺术有强烈的欣赏，努力在生活的各个领域创造和谐。属羊的人慷慨大方，总是愿意帮助有需要的人。</p>
<h3>五行与幸运元素</h3>
<p>羊在五行中属土。幸运颜色为绿色、红色和紫色。幸运数字是 2、7 和 8。羊的六合生肖是兔、马和猪，而牛被认为是最不配的生肖。</p>
<h3>属羊人的爱情与人际关系</h3>
<p>在感情方面，属羊的人体贴、 nurturing 且 deeply romantic。他们创造温暖 loving 的家庭，是 devoted 的伴侣，将所爱之人的幸福置于一切之上。</p>`
  },
  monkey: {
    en: `<h2>Monkey Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Monkey (猴) is the ninth sign of the Chinese zodiac. People born in the Year of the Monkey are known for their wit, intelligence, and versatility. In Chinese culture, the Monkey symbolizes cleverness, curiosity, and mischief.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Monkey</strong>: 2028, 2016, 2004, 1992, 1980, 1968, 1956, 1944, 1932.</p>
<h3>Monkey Personality Traits</h3>
<p>Monkey individuals are sharp, innovative, and endlessly curious. They are natural problem-solvers who can think outside the box and find creative solutions to complex challenges. Monkeys are social butterflies who thrive in dynamic, stimulating environments.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Monkey is associated with the Metal element. Lucky colors include white, blue, and gold. Lucky numbers are 4, 9, and numbers containing 7 and 8. The Monkey's compatible signs are Rat, Dragon, and Snake, while the Tiger is considered the least compatible.</p>
<h3>Monkey in Love &amp; Relationships</h3>
<p>In relationships, Monkeys are playful, charming, and intellectually stimulating. They need a partner who can keep up with their wit and share their love of adventure. Monkeys are loyal but require mental stimulation to stay engaged.</p>`,
    zh: `<h2>生肖猴 — 性格、运势与特质详解</h2>
<p>猴是十二生肖中的第九位。属猴的人以机智、聪明和多才多艺著称。在中国文化中，猴象征着聪明、好奇和调皮。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>猴</strong>：2028、2016、2004、1992、1980、1968、1956、1944、1932。</p>
<h3>属猴人的性格特点</h3>
<p>属猴的人敏锐、创新且充满好奇心。他们是天然的问题解决者，能够跳出框框思考，为复杂挑战找到创造性的解决方案。猴是社交达人，在动态、刺激的环境中茁壮成长。</p>
<h3>五行与幸运元素</h3>
<p>猴在五行中属金。幸运颜色为白色、蓝色和金色。幸运数字是 4、9 和含 7、8 的数字。猴的六合生肖是鼠、龙和蛇，而虎被认为是最不配的生肖。</p>
<h3>属猴人的爱情与人际关系</h3>
<p>在感情方面，属猴的人 playful、迷人且 intellectually stimulating。他们需要一个能跟上他们机智、分享他们对冒险热爱的伴侣。猴是忠诚的，但需要精神刺激来保持投入。</p>`
  },
  rooster: {
    en: `<h2>Rooster Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Rooster (鸡) is the tenth sign of the Chinese zodiac. People born in the Year of the Rooster are known for their observant nature, hard work, and courage. In Chinese culture, the Rooster symbolizes punctuality, honesty, and flamboyance.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Rooster</strong>: 2029, 2017, 2005, 1993, 1981, 1969, 1957, 1945, 1933.</p>
<h3>Rooster Personality Traits</h3>
<p>Rooster individuals are honest, energetic, and confident. They have a keen eye for detail and take pride in their appearance and accomplishments. Roosters are natural organizers who excel at managing projects and people with precision and efficiency.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Rooster is associated with the Metal element. Lucky colors include gold, brown, and yellow. Lucky numbers are 5, 7, and 8. The Rooster's compatible signs are Ox, Dragon, and Snake, while the Rabbit is considered the least compatible.</p>
<h3>Rooster in Love &amp; Relationships</h3>
<p>In relationships, Roosters are loyal, supportive, and expressive. They show love through acts of service and enjoy creating beautiful experiences for their partners. Roosters value honesty and open communication in their relationships.</p>`,
    zh: `<h2>生肖鸡 — 性格、运势与特质详解</h2>
<p>鸡是十二生肖中的第十位。属鸡的人以善于观察、勤奋和勇敢著称。在中国文化中，鸡象征着守时、诚实和华丽。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>鸡</strong>：2029、2017、2005、1993、1981、1969、1957、1945、1933。</p>
<h3>属鸡人的性格特点</h3>
<p>属鸡的人诚实、精力充沛且自信。他们对细节有敏锐的眼光，为自己的外表和成就感到自豪。鸡是天然的组织者，擅长以精确和高效管理项目和人员。</p>
<h3>五行与幸运元素</h3>
<p>鸡在五行中属金。幸运颜色为金色、棕色和黄色。幸运数字是 5、7 和 8。鸡的六合生肖是牛、龙和蛇，而兔被认为是最不配的生肖。</p>
<h3>属鸡人的爱情与人际关系</h3>
<p>在感情方面，属鸡的人忠诚、支持性强且善于表达。他们通过服务行为表达爱意，享受为伴侣创造美好体验。鸡在关系中重视诚实和开放的沟通。</p>`
  },
  dog: {
    en: `<h2>Dog Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Dog (狗) is the eleventh sign of the Chinese zodiac. People born in the Year of the Dog are known for their loyalty, honesty, and sense of justice. In Chinese culture, the Dog symbolizes fidelity, kindness, and vigilance.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Dog</strong>: 2030, 2018, 2006, 1994, 1982, 1970, 1958, 1946, 1934.</p>
<h3>Dog Personality Traits</h3>
<p>Dog individuals are loyal, faithful, and incredibly reliable. They have a strong sense of right and wrong and will stand up for what they believe in. Dogs are empathetic listeners who genuinely care about the well-being of others.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Dog is associated with the Earth element. Lucky colors include red, green, and purple. Lucky numbers are 3, 4, and 9. The Dog's compatible signs are Tiger, Horse, and Rabbit, while the Dragon is considered the least compatible.</p>
<h3>Dog in Love &amp; Relationships</h3>
<p>In relationships, Dogs are devoted, protective, and incredibly loyal. They are the type of partner who will always have your back. Dogs value trust and sincerity above all else and seek relationships built on mutual respect and understanding.</p>`,
    zh: `<h2>生肖狗 — 性格、运势与特质详解</h2>
<p>狗是十二生肖中的第十一位。属狗的人以忠诚、诚实和正义感著称。在中国文化中，狗象征着忠实、善良和警觉。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>狗</strong>：2030、2018、2006、1994、1982、1970、1958、1946、1934。</p>
<h3>属狗人的性格特点</h3>
<p>属狗的人忠诚、可靠且极其值得信赖。他们有强烈的是非观，会为自己相信的事挺身而出。狗是具有同理心的倾听者，真正关心他人的福祉。</p>
<h3>五行与幸运元素</h3>
<p>狗在五行中属土。幸运颜色为红色、绿色和紫色。幸运数字是 3、4 和 9。狗的六合生肖是虎、马和兔，而龙被认为是最不配的生肖。</p>
<h3>属狗人的爱情与人际关系</h3>
<p>在感情方面，属狗的人 devoted、保护欲强且极其忠诚。他们是那种永远支持你的伴侣。狗最重视信任和真诚，寻找建立在相互尊重和理解基础上的关系。</p>`
  },
  pig: {
    en: `<h2>Pig Chinese Zodiac — Personality, Fortune &amp; Traits</h2>
<p>The Pig (猪) is the twelfth and final sign of the Chinese zodiac. People born in the Year of the Pig are known for their generosity, diligence, and compassion. In Chinese culture, the Pig symbolizes wealth, prosperity, and good fortune.</p>
<h3>Birth Years</h3>
<p>If you were born in any of these years, your Chinese zodiac sign is <strong>Pig</strong>: 2031, 2019, 2007, 1995, 1983, 1971, 1959, 1947, 1935.</p>
<h3>Pig Personality Traits</h3>
<p>Pig individuals are generous, honest, and warm-hearted. They enjoy the finer things in life and work hard to provide comfort for themselves and their loved ones. Pigs are optimists who see the best in people and situations, making them wonderful companions.</p>
<h3>Five Elements &amp; Lucky Elements</h3>
<p>The Pig is associated with the Water element. Lucky colors include yellow, grey, and brown. Lucky numbers are 2, 5, and 8. The Pig's compatible signs are Rabbit, Tiger, and Goat, while the Snake is considered the least compatible.</p>
<h3>Pig in Love &amp; Relationships</h3>
<p>In relationships, Pigs are loving, generous, and deeply committed. They enjoy pampering their partners and creating a comfortable, happy home. Pigs value harmony and will go to great lengths to ensure their loved ones feel cherished.</p>`,
    zh: `<h2>生肖猪 — 性格、运势与特质详解</h2>
<p>猪是十二生肖中的第十二位，也是最后一位。属猪的人以慷慨、勤奋和同情心著称。在中国文化中，猪象征着财富、繁荣和好运。</p>
<h3>出生年份</h3>
<p>如果你出生于以下年份，你的生肖是<strong>猪</strong>：2031、2019、2007、1995、1983、1971、1959、1947、1935。</p>
<h3>属猪人的性格特点</h3>
<p>属猪的人慷慨、诚实且热心。他们享受生活中的美好事物，努力工作为自己和所爱之人提供舒适。猪是乐观主义者，看到人和情况最好的一面，是极好的伴侣。</p>
<h3>五行与幸运元素</h3>
<p>猪在五行中属水。幸运颜色为黄色、灰色和棕色。幸运数字是 2、5 和 8。猪的六合生肖是兔、虎和羊，而蛇被认为是最不配的生肖。</p>
<h3>属猪人的爱情与人际关系</h3>
<p>在感情方面，属猪的人 loving、慷慨且 deeply committed。他们喜欢 pampering 伴侣，创造舒适、幸福的家。猪重视和谐，会竭尽全力确保所爱之人感到被珍惜。</p>`
  }
};

// ─── 生肖性格关键词（用于 Meta Description，命中长尾搜索词）───
const ZODIAC_TRAITS = {
  '鼠': 'intelligent, adaptable, resourceful',
  '牛': 'diligent, dependable, hardworking',
  '虎': 'courageous, confident, natural leader',
  '兔': 'gentle, elegant, compassionate',
  '龙': 'ambitious, charismatic, lucky',
  '蛇': 'wise, intuitive, analytical',
  '马': 'energetic, independent, adventurous',
  '羊': 'creative, kind, harmonious',
  '猴': 'clever, witty, versatile',
  '鸡': 'observant, honest, punctual',
  '狗': 'loyal, faithful, protective',
  '猪': 'compassionate, generous, sincere'
};

// ─── 天干 ───
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const TIANGAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const TIANGAN_YINYANG = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// ─── 地支 ───
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DIZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
const DIZHI_YINYANG = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// ─── 六合 ───
const LIUHE = { '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午' };

// ─── 六冲（值年太岁相冲） ───
const LUICHONG = { '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳' };

// ─── 三合（半合） ───
const SANHE = { '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'], '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'], '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'], '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'] };

// ─── 相害 ───
const XIANGHAI = { '子': '未', '丑': '午', '寅': '巳', '卯': '辰', '辰': '卯', '巳': '寅', '午': '丑', '未': '子', '申': '亥', '酉': '戌', '戌': '酉', '亥': '申' };

// ─── 相刑 ───
const XIANGXING = { '子': '卯', '卯': '子', '寅': '巳', '巳': '寅', '申': '亥', '亥': '申', '丑': '戌', '戌': '丑', '辰': '辰', '午': '午', '酉': '酉', '未': '未' };

// ─── 二十四节气 ───
const SOLAR_TERMS = {
  '01-05': '小寒', '01-20': '大寒',
  '02-04': '立春', '02-19': '雨水',
  '03-05': '惊蛰', '03-20': '春分',
  '04-04': '清明', '04-20': '谷雨',
  '05-05': '立夏', '05-21': '小满',
  '06-05': '芒种', '06-21': '夏至',
  '07-07': '小暑', '07-22': '大暑',
  '08-07': '立秋', '08-23': '处暑',
  '09-07': '白露', '09-23': '秋分',
  '10-08': '寒露', '10-23': '霜降',
  '11-07': '立冬', '11-22': '小雪',
  '12-07': '大雪', '12-21': '冬至',
};

// ─── 五行颜色 ───
const WUXING_COLORS = {
  '木': { hex: '#5E825E', name: '绿色' },
  '火': { hex: '#B8665E', name: '红色' },
  '土': { hex: '#9E8E6E', name: '棕色' },
  '金': { hex: '#D4AF37', name: '金色' },
  '水': { hex: '#5B8299', name: '蓝色' },
};

// ─── 金句库（100条，用户提供，按顺序循环）───
const BASE_QUOTES = [
  // 一、成长与坚持（1-20）
  '慢慢来，比较快', '每一步都算数', '坚持就是胜利', '今天比昨天好',
  '种子终会发芽', '水滴石穿的力量', '不积跬步无以至千里', '努力终有回报',
  '每天进步一点点', '时间会给出答案', '慢慢走，沿途有风景', '你比想象中坚强',
  '不怕慢，只怕停', '成长需要耐心', '所有坚持都有意义', '熬过黑夜就是黎明',
  '扎根才能枝繁叶茂', '沉淀是为了爆发', '日拱一卒无有尽', '功不唐捐终入海',
  // 二、希望与光明（21-40）
  '阳光总在风雨后', '黑暗尽头是光明', '明天会更好', '希望永不灭',
  '向阳而生', '心若向阳无畏悲伤', '光就在前方', '拨开云雾见月明',
  '寒冬过后是春天', '黎明前的夜最黑', '总有一束光为你亮', '雨后会天晴',
  '星光不问赶路人', '万物皆有裂痕', '那是光照进来的地方', '心有明灯不迷茫',
  '追光的人终会光芒万丈', '破茧才能成蝶', '涅槃重生', '风雨过后见彩虹',
  // 三、心态与心境（41-60）
  '心宽路就宽', '放下便是拥有', '随缘自在', '心静自然凉',
  '知足常乐', '平常心是道', '一切都是最好的安排', '顺其自然',
  '心安即是归处', '从容面对一切', '不争不抢自有岁月打赏', '慢下来，感受生活',
  '内心丰盈者独行也众', '心若不动风又奈何', '淡定从容是最好的状态', '修心养性',
  '一念放下万般自在', '心简单世界就简单', '温柔对待这个世界', '与自己和解',
  // 四、行动与勇气（61-80）
  '勇敢出发', '想做就去做', '行动是最好的答案', '迈出第一步',
  '趁年轻去追梦', '乘风破浪', '逆风翻盘', '越挫越勇',
  '敢于重新开始', '去成为你想成为的人', '不要等，现在就出发', '行动力决定未来',
  '去做就对了', '勇敢的人先享受世界', '路在脚下', '向前看别回头',
  '敢于突破自己', '逆风飞翔', '迎难而上', '勇者无畏',
  // 五、自然与哲理（81-100）
  '道法自然', '万物皆有定时', '春生夏长秋收冬藏', '顺应天时',
  '花开有时', '草木有本心', '天地有大美', '静水流深',
  '厚德载物', '上善若水', '大道至简', '返璞归真',
  '天人合一', '万物并育而不相害', '顺势而为', '风物长宜放眼量',
  '守得云开见月明', '岁月从不败美人', '人间值得', '未来可期',
];

// ─── 节气金句 ───
const SOLAR_TERM_QUOTES = {
  '小寒': '寒梅傲雪，静待春归。', '大寒': '瑞雪兆丰，静待花开。',
  '立春': '春回大地，万物复苏。', '雨水': '细雨润物，生机勃发。',
  '惊蛰': '春雷惊醒，蛰虫始振。', '春分': '昼夜均分，阴阳平衡。',
  '清明': '清明时节，春暖花开。', '谷雨': '雨生百谷，播种希望。',
  '立夏': '夏日至临，阳气渐盛。', '小满': '小满未满，盈而不溢。',
  '芒种': '芒种忙种，有收有种。', '夏至': '阳极阴生，昼长夜短。',
  '小暑': '小暑温风，至而未极。', '大暑': '大暑酷热，乘凉养生。',
  '立秋': '秋高气爽，收获在望。', '处暑': '暑气渐消，秋意渐浓。',
  '白露': '白露为霜，秋意渐深。', '秋分': '秋分昼夜，寒暑平分。',
  '寒露': '寒露凝霜，注意添衣。', '霜降': '霜降天凉，保暖为上。',
  '立冬': '冬藏万物，养精蓄锐。', '小雪': '小雪封地，保暖驱寒。',
  '大雪': '大雪纷飞，银装素裹。', '冬至': '冬至阳生，一阳复始。',
};

// ─── 节日金句 ───
const FESTIVAL_QUOTES = {
  '01-01': '元旦吉祥，开年大吉！', '01-28': '除夕团圆，福满人间。',
  '01-29': '新春快乐，万事如意！', '02-14': '情人节快乐，有情人终成眷属。',
  '04-05': '清明追思，慎终追远。', '05-01': '劳动最光荣，向劳动者致敬！',
  '05-05': '端午安康，粽香四溢。', '06-01': '儿童节快乐，永葆童心。',
  '08-22': '中 秋 佳 节 ， 月 圆 人 团 圆 。',
  '10-01': '国庆快乐，祖国万岁！',
  '09-09': '重阳登高，福寿安康。',
  '12-25': '圣诞快乐，平安吉祥！',
};

// ════════════════════════════════════════════════════════════
// 核心函数
// ════════════════════════════════════════════════════════════

/**
 * 计算指定日期的天干地支
 * @param {Date} date
 * @returns {Object} { ganzhi, tiangan, dizhi, wuxing, yinyang }
 */
function calculateGanzhi(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 简化算法：基于1900年1月1日（庚子日）为基准
  // 1900-01-01 是甲子日，天干索引0，地支索引0
  const baseDate = new Date(1900, 0, 1);
  const daysDiff = Math.floor((date - baseDate) / (24 * 60 * 60 * 1000));

  // 日干支：基准1900-01-01是甲子日（index 0），+daysDiff天后是对应干支
  const dayGanIndex = (daysDiff) % 10;
  const dayZhiIndex = (daysDiff) % 12;

  // 年干支：1900年是庚子年
  const yearGanIndex = (year - 1900 + 6) % 10;
  const yearZhiIndex = (year - 1900) % 12;

  // 月干支：月令以节气为准，简化用月份估算
  // 寅月（立春后）开始，月干 = (年干 * 2 + 月份) % 10
  const monthGanIndex = ((yearGanIndex * 2 + month) % 10);

  const tiangan = TIANGAN[dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10];
  const dizhi = DIZHI[dayZhiIndex >= 0 ? dayZhiIndex : dayZhiIndex + 12];
  const wuxing = TIANGAN_WUXING[dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10];

  return {
    ganzhi: tiangan + dizhi,
    tiangan,
    dizhi,
    wuxing,
    tianganIndex: dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10,
    dizhiIndex: dayZhiIndex >= 0 ? dayZhiIndex : dayZhiIndex + 12,
    yearGan: TIANGAN[yearGanIndex],
    yearZhi: DIZHI[yearZhiIndex],
  };
}

/**
 * 获取冲、害、刑生肖
 */
function getRelations(dizhi) {
  const chong = LUICHONG[dizhi] || null;
  const hai = XIANGHAI[dizhi] || null;
  const xing = XIANGXING[dizhi] || null;
  const he = LIUHE[dizhi] || null;

  // 三合半合（地支三会）
  const sanheTargets = SANHE[dizhi] || [];

  return { chong, hai, xing, he, sanhe: sanheTargets };
}

/**
 * 检测节气
 */
function getSolarTerm(dateStr) {
  const monthDay = dateStr.slice(5); // MM-DD
  return SOLAR_TERMS[monthDay] || null;
}

/**
 * 检测节日
 */
function getFestival(dateStr) {
  const monthDay = dateStr.slice(5);
  // 农历节日简化：只用公历固定节日
  return FESTIVAL_QUOTES[monthDay] || null;
}

/**
 * 计算运势分数（基于五行生克）
 */
function calculateScore(zodiac, ganzhi, relations, rizhuWuxing) {
  const { sign, element } = zodiac;
  const targetWuxing = DIZHI_WUXING[DIZHI.indexOf(relations.he)] || rizhuWuxing;
  let score = 70; // 基础分

  // 六合加15分
  if (relations.he === sign) score += 15;

  // 三合加10分
  if (relations.sanhe.includes(sign)) score += 10;

  // 冲减20分
  if (relations.chong === sign) score -= 20;

  // 害减10分
  if (relations.hai === sign) score -= 10;

  // 刑减15分
  if (relations.xing === sign) score -= 15;

  // 生肖五行与日干五行相生加10分
  const elementRelations = { '木': { '生': '火', '克': '土' }, '火': { '生': '土', '克': '金' }, '土': { '生': '金', '克': '水' }, '金': { '生': '水', '克': '木' }, '水': { '生': '木', '克': '火' } };
  if (elementRelations[element]?.['生'] === rizhuWuxing) score += 10;

  // 确保在55-95范围内
  return Math.max(55, Math.min(95, score));
}

/**
 * 生成运势判断词
 */
function getVerdict(score, relations, zodiacSign) {
  if (relations.chong === zodiacSign || relations.xing === zodiacSign) return '降低';
  if (relations.hai === zodiacSign) return '喜忧参半';
  if (relations.he === zodiacSign || relations.sanhe.includes(zodiacSign)) {
    return score >= 80 ? '上升' : '稳定';
  }
  if (score >= 85) return '上升';
  if (score >= 70) return '一般';
  return '降低';
}

/**
 * 生成工作/事业描述（扩展到150字）
 */
function generateWorkText(name, verdict, relations, zodiacSign) {
  const isHe = relations.he === zodiacSign || relations.sanhe.includes(zodiacSign);
  const isChong = relations.chong === zodiacSign;
  const isHai = relations.hai === zodiacSign;

  if (verdict === '上升') {
    return `${name}今日与天时相合，运势扶摇直上，吉星高照。工作上贵人暗助，有想法尽管提，很可能得到认可和采纳。今日适合主动出击，求职、面试、谈合作都有好结果。领导对你印象不错，可能会有意外的表扬或奖励降临。注意把握机遇，错过可能需要再等很久。另外，今天也适合整理工作环境或计划接下来的安排，会有新的灵感涌现。`;
  }
  if (verdict === '降低' || isChong) {
    return `${name}今日运势受阻，工作上容易犯小人，可能被领导或同事挑剔，凡事多留个心眼。有可能在文书、合同、报表上出现小失误，提交前一定要仔细核对三遍。保持低调谦虚的态度，遇事多忍让，不要强出头。今日适合处理日常事务，不宜做重大决策或冒险尝试。与同事沟通时注意语气，避免引起不必要的误会。`;
  }
  if (verdict === '喜忧参半') {
    return `今日工作上能够自我反省和总结，容易获得领导认可，但也要小心同事间的竞争，有人可能在暗中观察你的一举一动。稳中求进是今日的关键词，不要急于表现自己，踏实地完成手头的工作比什么都重要。今日适合做一些幕后的准备工作，为接下来的项目打基础。`;
  }
  return `今日工作平稳，做事按部就班，不会有太大波澜。适合处理日常事务，按计划推进即可，不必追求大突破。有小问题及时沟通解决，不要积压。稳扎稳打就是在为明天蓄力，今天的每一份付出都会在未来的某个时刻得到回报。`;
}

/**
 * 生成财运描述（扩展到100字）
 */
function generateMoneyText(verdict, score) {
  if (verdict === '上升') {
    return `正财收入稳定，可能会有额外奖金或加薪的好消息传来。偏财也有小惊喜，适合投资理财，但要见好就收，不宜贪心。今天适合关注与金钱相关的信息，比如账单、账目核对等，可能会发现之前遗漏的收支。如果有借贷或合作财务的机会，今天可以积极洽谈，但记得签合同前仔细看清每一条款。`;
  }
  if (verdict === '降低') {
    return `今日有小额钱财入账但守不住，因为有冲动消费倾向，购物或网络支付时要三思而后行。建议提前做好预算计划，把该存的先存起来，不要留太多现金在手边。今天也不适合做任何形式的投机行为，包括股票、彩票、赌博等。守现有资产为主，避免冒险。如果有人向你借钱或推销投资产品，果断拒绝为妙。`;
  }
  return `今日求稳为主，不宜做重大财务决策，偏财运一般，远离投机行为，保守理财为上策。今天在花钱方面要有所克制，非必要的消费尽量推迟到明天。同时这也是一个盘点财务状况的好日子，整理收支记录，制定接下来的储蓄计划，会有不错的收获。`;
}

/**
 * 生成感情描述（扩展到120字）
 */
function generateLoveText(name, verdict, isHe, isChong, zodiacSign) {
  if (verdict === '上升' || isHe) {
    return `感情上，单身${name}今日桃花运非常不错，有机会遇到心仪对象，勇敢表达会有惊喜！无论是社交场合还是日常相处，都散发着独特的魅力，吸引异性的目光。已婚或有伴侣者感情甜蜜默契，两人之间沟通顺畅，适合计划未来的事情，比如旅行、买房等人生大事。今日也适合与伴侣共进晚餐，重温浪漫时光。`;
  }
  if (verdict === '降低' || isChong) {
    return `感情上要谨慎，已婚或有伴侣者应避免与异性走得太近，以免引起误会。单身${name}今日桃花运较弱，不宜表白或推进感情，维持现状就好。今天在感情方面可能会感到有些孤独或失落，但这是暂时的，不妨把精力放在自我提升上，比如学习新技能、培养新爱好，缘分会在合适的时候到来。`;
  }
  if (verdict === '喜忧参半') {
    return `感情上今日容易受外界干扰，身边可能出现让你心动的异性，但要仔细分辨是好感还是一时冲动，不妨冷静下来好好审视眼前人，三思而后行。已婚者要警惕第三者的介入，有话好好说，多站在对方的角度思考问题。今日适合与伴侣进行深度沟通，聊聊彼此的想法和感受。`;
  }
  return `感情上，已婚或有伴侣的${name}要多花时间陪伴另一半，多沟通多关心，不要让忙碌成为忽略感情的借口。单身${name}今日桃花运普通，不必刻意强求，缘分到了自然会有。可以多参加一些社交活动拓宽圈子，或者把注意力放在自我成长上。今日适合学习如何更好地表达爱意和接收来自他人的情感。`;
}

/**
 * 生成健康描述（扩展到80字）
 */
function generateHealthText(verdict, rizhuWuxing) {
  if (verdict === '降低') {
    const healthTips = rizhuWuxing === '火' ? '心血管' : rizhuWuxing === '水' ? '肾泌尿' : '肠胃';
    return `健康上要注意${healthTips}系统，今日操劳过度容易疲劳，免疫力可能会有所下降，容易感冒或出现一些小毛小病。要主动给自己减压，保证充足睡眠，不要硬撑，身体是革命的本钱。建议晚上早点休息，泡泡脚放松一下。`;
  }
  if (verdict === '上升') {
    return `健康状态良好，精神饱满，状态全天在线，精力充沛，适合运动锻炼或户外活动。今天也是调理身体的好日子，可以尝试一些新的健康习惯，比如晨跑、瑜伽或者调整饮食结构。你的身体状态非常配合你的行动，坚持下去会有意想不到的收获。`;
  }
  return `健康方面注意肠胃保养，饮食宜清淡有节制，整体状态平稳，注意劳逸结合。今天适合进行一些温和的锻炼，比如散步、太极等，不要做过于剧烈的运动。如果有时间，可以给自己安排一次体检或者健康咨询，防患于未然。`;
}

/**
 * 生成宜忌
 */
function generateYiJi(wuxing) {
  const yiMap = {
    '木': ['栽种', '入学', '祈福'], '火': ['开业', '交易', '出行'],
    '土': ['修造', '动土', '安床'], '金': ['求财', '投资', '纳财'],
    '水': ['出行', '搬家', '沐浴'],
  };
  const jiMap = {
    '木': ['搬家', '动土'], '火': ['安葬', '诉讼'],
    '土': ['开业', '动土'], '金': ['搬家', '安床'],
    '水': ['开业', '安葬'],
  };
  return { yi: yiMap[wuxing] || ['祈福', '出行'], ji: jiMap[wuxing] || ['动土', '安葬'] };
}

/**
 * 生成单条中文运势（目标300-500字）
 */

/**
 * 生成中文运势（AI推理版：喂完整四柱给AI做命理解读）
 */
async function generateFortuneCN(zodiac, ganzhi, relations, fourPillars) {
  const { key, name, sign } = zodiac;
  // 保留算法评分/判定（AI内容用，评分不影响内容）
  const score = calculateScore(zodiac, ganzhi, relations, ganzhi.wuxing);
  const verdict = getVerdict(score, relations, sign);

  // 五行名称映射
  const WX_CN = ['木', '火', '土', '金', '水'];

  // 用AI推理（DashScope API）
  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (DASHSCOPE_API_KEY) {
    try {
      const fp = fourPillars;
      const wxStr = fp.wuxingCount.map(w => `${w.element}×${w.count}`).join(' | ');

      const systemPrompt = `你是一位资深命理师，根据当日天干地支为读者推演每日生肖运势。风格参考"不二堂"每日运势专栏。

## 今日四柱信息
- 日柱干支：${fp.day.ganzhi}（${fp.day.stem}${fp.day.wuxing}）
- 年柱：${fp.year.ganzhi} | 月柱：${fp.month.ganzhi} | 时柱：${fp.hour.ganzhi}
- 五行分布：${wxStr}
- 属${sign}者，与日支${fp.day.branch}${relations.he ? '六合' : ''}${relations.chong ? '相冲' : ''}${relations.hai ? '相害' : ''}${relations.xing ? '相刑' : ''}

## 今日运势判断
- 综合评分：${score}/100
- 运势判断：${verdict}

## 推演要求（核心）
- **你必须根据今日四柱的实际干支关系来推演**，不是套模板
- 今日是${fp.day.ganzhi}日，属${name}（${sign}）者，与日支${fp.day.branch}的关系：${relations.he === sign ? '六合' : ''}${relations.chong === sign ? '相冲' : ''}${relations.hai === sign ? '相害' : ''}${relations.xing === sign ? '相刑' : ''}${relations.sanhe.includes(sign) ? '三合' : ''}${relations.he !== sign && relations.chong !== sign && relations.hai !== sign && relations.xing !== sign && !relations.sanhe.includes(sign) ? '无特殊关系' : ''}
- **每天的四柱不同，推演结果必须完全不同**——禁止复用昨日的话术、句式、场景
- **只给判断，不解释原理**——读者不需要知道为什么，只需要知道今天会怎样、该做什么
- **必须覆盖四个维度**：事业、财运、感情、健康，自然融合在段落中

## 不二堂风格参考（必须遵守）

> 生肖猴今日运势吉凶参半，人缘佳，但做事压力大，朋友之间会因为金钱矛盾产生纠纷，工作上执行力亦强，可开拓市场。
> 生肖鸡今日运势吉凶参半，贵人明透，但暗中容易受阻，投资需谨慎，有劫财的迹象，可能会因为家人朋友而花钱，要控制情绪，谨防火伤感情。
> 生肖狗今日运势一般，凡事不宜激进，不利投资，有劫财的迹象，杜绝冲动消费，要控制情绪，谨防发火伤身体，身体上容易失眠。

### 核心特征
| 维度 | 要求 |
|------|------|
| **开头** | 开门见山："生肖X今日运势[吉凶参半/平稳/下降/上升]，[一句话总结]" |
| **结构** | 按领域展开（事业→财运→感情→健康），自然融合，不分条列举 |
| **内容** | 每个领域有**趋势判断 + 方向建议**（如"工作上执行力强，可开拓市场"） |
| **术语** | 允许使用：吉凶参半、贵人、劫财、六合、相冲、相害、奔波之象、冲犯日建 |
| **字数** | 100-180 字，精炼有力 |
| **禁忌** | 不讲故事、不用生活化场景开头、不写空话套话、不出现具体时间/地点/人物 |

## 四个"不"（最高优先级）

### 1. 不重复
- 禁止复用昨日的话术、句式、场景
- 禁止使用"情绪容易起伏"、"上午易烦躁，下午渐稳"、"烂桃花"、"旧情人纠缠"等高频重复词
- **每次生成前，先想想昨天用了什么词，今天换一批**

### 2. 不模版化
- 禁止使用"煮粥/煮茶/泡茶/做饭/晾衣服/种花"等生活比喻开头
- 禁止使用"今天走在路上/邻居/同事突然问你"等场景故事开头
- 禁止使用"像泡茶一样/如同平静的湖面/如同硬币的两面"等比喻修辞
- 禁止使用"火势过旺"、"贵人暗助"、"诸事顺势"、"气机畅达"、"午后静坐"等 AI 模板词
- 禁止使用"正财平稳"、"人缘佳"、"身体无碍"、"偏财勿贪"等通用套话
- **必须**开门见山，第一句就是"生肖${name}今日运势[吉凶参半/平稳/下降/上升]，[核心判断]"

### 3. 不具象化
- 禁止编造具体事件（如"下午三点被拉进紧急协调会"、"左膝痛"、"报销到账"、"同事甩锅"）
- 禁止出现具体时间（如"下午三点"、"上午九点"）、具体地点（如"地铁口"、"咖啡馆"）、具体人物（如"中年女性同事"、"旧情人"）
- **运势是趋势判断，不是事件预测**

### 4. 不二堂风格
- 语言：大白话 + 命理判断，不文言、不文艺、不鸡汤
- 判断：趋势性描述（如"工作上执行力强"、"投资需谨慎"、"身体方面容易失眠"）
- 建议：方向性指导（如"可开拓市场"、"需控制情绪"、"适合清淡饮食"）
- 推演：必须结合今日四柱关系（如"因日支与${sign}${relations.he ? '六合' : ''}${relations.chong ? '相冲' : ''}${relations.hai ? '相害' : ''}${relations.xing ? '相刑' : ''}，..."）

## 输出要求
- 只输出运势内容，无标题前言后记
- **禁止使用 # 符号**
- 段与段之间用空行分隔
- 内容要具体有针对性，不要空话套话
- 一段即可，不要分条列举
- **禁止**解释原理（如"火旺则..."），**禁止**编造"明日发生事件"`;

      const userPrompt = `请为属${name}（${sign}）之人写今日运势解读。`;

      const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`   🌟 AI生成运势成功 (${content.length}字)`);
          return {
            score,
            verdict,
            content,
            yi: ['出行', '搬家', '沐浴'], // AI生成内容里包含，这里只用于标签
            ji: ['开业', '安葬'],
          };
        }
      } else {
        console.warn(`   ⚠️ AI运势生成失败: ${res.status}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ AI运势异常: ${err.message}`);
    }
  }

  // Fallback：使用模板（无API时）
  console.log(`   📝 使用模板运势（无AI）`);

  const workText = generateWorkText(name, verdict, relations, sign);
  const moneyText = generateMoneyText(verdict, score);
  const loveText = generateLoveText(name, verdict, relations.he === sign || relations.sanhe.includes(sign), relations.chong === sign, sign);
  const healthText = generateHealthText(verdict, ganzhi.wuxing);
  const { yi, ji } = generateYiJi(ganzhi.wuxing);

  // 生成判断句（扩展到60字）
  let verdictIntro = '';
  if (verdict === '上升') {
    verdictIntro = `${name}今日运势扶摇直上，吉星高照，多年积累的人脉和努力即将开花结果。无论是工作、财运还是感情，都有惊喜在等着你，是难得的好日子，好好把握不要浪费。`;
  } else if (verdict === '降低') {
    verdictIntro = `${name}今日运势走低，不利因素较多，做事容易事倍功半。保持低调谦和的心态，凡事多留一个心眼，不要做出冲动的决定或冒险的举动。今天的核心是「守」，守住现有的成果比追求新的突破更重要。`;
  } else if (verdict === '喜忧参半') {
    verdictIntro = `${name}今日运势喜忧参半，如同硬币的两面，有让你开心的事，也有需要你冷静应对的挑战。机遇与风险并存，需要你有一双慧眼去分辨，更需要一颗沉稳的心去应对。乐观但不盲目，积极但不失理性。`;
  } else {
    verdictIntro = `${name}今日运势平稳，做事按部就班，不会有太大波澜。如同平静的湖面，适合整理思绪、规划未来。不必急于求成，今天的每一步都是在为明天的爆发积蓄力量。`;
  }

  // 生成结尾提醒（扩展到40字）
  let tipText = verdict === '上升'
    ? `今日宜${yi[0]}、${yi[1]}，好好把握这难得的好运势。机会不等人，错过可能需要再等一年。`
    : verdict === '降低'
    ? `今日诸事小心，能不折腾就不折腾，多静少动，不要给自己找麻烦。遇事多请教身边可信的朋友。`
    : verdict === '喜忧参半'
    ? `保持清醒的头脑，不要被表面的风光迷惑。今日适合规划多于行动，三思而后行是明智之选。`
    : `整体以静制动，不要强出头。稳扎稳打，熬过今天明天就会好转，耐心是今日最重要的品质。`;

  const content = verdictIntro + workText + moneyText + loveText + healthText + tipText;

  return {
    score,
    verdict,
    content,
    yi,
    ji,
    length: content.length,
  };
}

/**
 * 生成英文运势（SEO优化版，async 调用 AI 翻译）
 */
async function generateFortuneEN(zodiac, cnData, ganzhi) {
  const { key, name, en } = zodiac;
  const { verdict, content, score, yi, ji, quote, luckyNum, direction, pair, blogLinksEN } = cnData;

  const verdictMap = {
    '上升': 'Rising luck - an excellent day for all endeavors',
    '降低': 'Challenging energy - caution and restraint recommended',
    '一般': 'Balanced day - steady progress without major fluctuations',
    '喜忧参半': 'Mixed fortune - opportunities balanced with challenges',
    '稳定': 'Stable energy - consistent and predictable day',
  };


  const rawEn = await translateToEnglish(content, en, verdict, key);
  // 提取英文金句
  const quoteEnMatch = rawEn.match(/QUOTE_EN:\s*(.+)/);
  const quoteEn = quoteEnMatch ? quoteEnMatch[1].trim() : quote;
  // 清理 AI 翻译中残留的零星中文词，防止「偏财运」等中文词混入英文
  // 注意：只用 /[ ]{2,}/ 清理多余空格，不用 /\s{2,}/（会把 \n\n 段落分隔也干掉）
  const enContent = rawEn.replace(/QUOTE_EN:\s*.+/g, '').replace(/[\u4e00-\u9fa5]+/g, '').replace(/[ ]{2,}/g, ' ').trim();

  return {
    keywords: null,
    verdict: verdictMap[verdict] || verdict,
    content: enContent,
    score,
    length: enContent.length,
    // 补全前端可能用到的字段
    yi,
    ji,
    quote,
    quoteEn,
    luckyNum,
    direction,
    pair,
    blogLinksEN,
  };
}

/**
 * 中译英（接入 DashScope API，扩展到300-500词，带SEO大词）
 */
async function translateToEnglish(cnText, zodiacEn, verdict, zodiacKey) {
  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  const DASHSCOPE_MODEL = 'qwen-plus';
  const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  // SEO 分层关键词（head / longTail / semantic）
  const seoTerms = {
    rat: {
      head: 'Chinese zodiac Rat, Rat daily horoscope, Rat fortune today',
      longTail: 'Rat horoscope today love, Rat career money prediction, what is Rat fortune today, Rat daily predictions, Rat zodiac compatibility reading',
      semantic: 'Five Elements water, Wu Xing Rat element, Rat personality Chinese astrology, Rat lucky numbers and directions'
    },
    ox: {
      head: 'Chinese zodiac Ox, Ox daily horoscope, Ox fortune today',
      longTail: 'Ox horoscope today love, Ox career money prediction, what is Ox fortune today, Ox daily predictions, Ox zodiac compatibility',
      semantic: 'Five Elements earth, Wu Xing Ox element, Ox personality traits, Ox lucky numbers and directions'
    },
    tiger: {
      head: 'Chinese zodiac Tiger, Tiger daily horoscope, Tiger fortune today',
      longTail: 'Tiger horoscope today love, Tiger career prediction, Tiger money luck today, Tiger daily zodiac reading',
      semantic: 'Five Elements wood, Wu Xing Tiger element, Tiger personality Chinese astrology, Tiger lucky directions'
    },
    rabbit: {
      head: 'Chinese zodiac Rabbit, Rabbit daily horoscope, Rabbit fortune today',
      longTail: 'Rabbit horoscope today love, Rabbit career money prediction, Rabbit daily zodiac reading, Rabbit love compatibility',
      semantic: 'Five Elements wood, Wu Xing Rabbit element, Rabbit personality traits, Rabbit lucky numbers'
    },
    dragon: {
      head: 'Chinese zodiac Dragon, Dragon daily horoscope, Dragon fortune today',
      longTail: 'Dragon horoscope today love, Dragon career money prediction, Dragon daily predictions 2026, Dragon zodiac power',
      semantic: 'Five Elements earth, Wu Xing Dragon element, Dragon personality Chinese astrology, Dragon lucky directions'
    },
    snake: {
      head: 'Chinese zodiac Snake, Snake daily horoscope, Snake fortune today',
      longTail: 'Snake horoscope today love, Snake career prediction, Snake money luck today, Snake daily zodiac reading',
      semantic: 'Five Elements fire, Wu Xing Snake element, Snake personality traits, Snake lucky numbers and directions'
    },
    horse: {
      head: 'Chinese zodiac Horse, Horse daily horoscope, Horse fortune today',
      longTail: 'Horse horoscope today love, Horse career money prediction, Horse daily predictions, Horse zodiac compatibility',
      semantic: 'Five Elements fire, Wu Xing Horse element, Horse personality Chinese astrology, Horse lucky directions'
    },
    goat: {
      head: 'Chinese zodiac Goat, Goat daily horoscope, Goat fortune today',
      longTail: 'Goat horoscope today love, Goat career money prediction, Goat daily zodiac reading, Goat love compatibility',
      semantic: 'Five Elements earth, Wu Xing Goat element, Goat personality traits, Goat lucky numbers'
    },
    monkey: {
      head: 'Chinese zodiac Monkey, Monkey daily horoscope, Monkey fortune today',
      longTail: 'Monkey horoscope today love, Monkey career prediction, Monkey money luck today, Monkey daily zodiac reading',
      semantic: 'Five Elements metal, Wu Xing Monkey element, Monkey personality Chinese astrology, Monkey lucky directions'
    },
    rooster: {
      head: 'Chinese zodiac Rooster, Rooster daily horoscope, Rooster fortune today',
      longTail: 'Rooster horoscope today love, Rooster career money prediction, Rooster daily predictions, Rooster zodiac compatibility',
      semantic: 'Five Elements metal, Wu Xing Rooster element, Rooster personality traits, Rooster lucky numbers and directions'
    },
    dog: {
      head: 'Chinese zodiac Dog, Dog daily horoscope, Dog fortune today',
      longTail: 'Dog horoscope today love, Dog career prediction, Dog money luck today, Dog daily zodiac reading',
      semantic: 'Five Elements earth, Wu Xing Dog element, Dog personality Chinese astrology, Dog lucky directions'
    },
    pig: {
      head: 'Chinese zodiac Pig, Pig daily horoscope, Pig fortune today',
      longTail: 'Pig horoscope today love, Pig career money prediction, Pig daily predictions, Pig zodiac compatibility reading',
      semantic: 'Five Elements water, Wu Xing Pig element, Pig personality traits, Pig lucky numbers and directions'
    },
  };

  const verdictMap = {
    '上升': 'Rising luck - an excellent day ahead',
    '降低': 'Challenging day - proceed with caution',
    '一般': 'Balanced day - steady progress expected',
    '喜忧参半': 'Mixed fortune - opportunities and challenges',
    '稳定': 'Stable energy - consistent day ahead',
  };

  // 如果有 DashScope API Key，用 AI 翻译
  if (DASHSCOPE_API_KEY) {
    try {
      const seo = seoTerms[zodiacKey] || seoTerms.rat;
      const systemPrompt = `You are an experienced Chinese astrology consultant translating daily horoscopes into clear, actionable English.

## Voice & Tone
- Write like a professional astrology reading — direct, decisive
- NO Chinese pinyin. Ever. Zero.
- Use standard English terms for concepts

## How to Handle Chinese Astrology Concepts
- Chinese zodiac animals: English names only
- 吉凶参半/平稳/下降/上升 → "mixed fortune" / "stable" / "challenging" / "rising luck"
- 贵人 → "helpful people"
- 劫财 → "unexpected expenses"
- 相冲/相害 → "clash"

## Formatting (CRITICAL)
- NO asterisks (*). No **bold**, *italic*
- NO # symbols. No headers.
- NO emojis. Zero.
- Output 2-4 short paragraphs, separated by TWO newlines (\n\n)
- **Total: 80-120 words** — concise like the Chinese source
- Follow the Chinese source naturally

## Content Requirements
- MUST cover four areas: work/career, finances, relationships, health
- Give **clear judgment + specific advice** for each area
- Use written, professional astrology style — like Chinese master's readings
- Examples: "execution strong, favorable for expansion" / "investment caution advised" / "control emotions, avoid conflicts"
- **NO colloquial language** — avoid "you'll get pulled into a meeting" style
- Don't explain WHY — just state WHAT will happen
- The content should feel **different each day** — never repeat fixed phrases
- No rambling stories or scene-setting openings

## SEO (REQUIRED)
- The phrase "Chinese zodiac ${zodiacEn}" MUST appear within the first 2-3 sentences
- Weave in 1-2 terms from: ${seo.head}. Keep it natural.

Translate the Chinese horoscope for ${zodiacEn} into clear English. Return ONLY the translated text, nothing else.`;

      const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: DASHSCOPE_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: cnText }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.choices?.[0]?.message?.content;
        if (translated) {
          // 兜底：AI 翻译未分段时，按句子强制分为 4-6 段
          const cleaned = forceEnglishParagraphs(translated);
          console.log(`   🌐 AI翻译成功 (${cleaned.length} chars)`);
          return cleaned;
        }
      } else {
        console.warn(`   ⚠️ DashScope API error: ${res.status}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Translation error: ${err.message}`);
    }
  }

  // Fallback: 硬编码英文版（无 API 时使用）
  console.log(`   📝 使用模板英文版`);
  let enText = '';

  if (verdict === '上升') {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Rising Luck Ahead\n\n`;
    enText += `The ${zodiacEn} is graced with exceptional celestial energy today, making this one of the most favorable periods for pursuing your goals. Your natural talents and accumulated efforts are well-supported by the Wu Xing elemental forces, creating ideal conditions for breakthrough moments in career, finance, and relationships.\n\n`;
    enText += `Career and Work: The ${zodiacEn} can expect positive developments in professional matters. If you have been considering a job change, asking for a raise, or launching a new project, today presents optimal timing. Your communication skills are enhanced, making it an excellent day for negotiations, presentations, or pitching ideas to decision-makers. Trust your instincts and express your thoughts with confidence.\n\n`;
    enText += `Financial Fortune: Your financial luck shows promising signs today. Steady income streams are reinforced, and there may be unexpected monetary gains or windfalls. This is a good time to review investment portfolios, though remember to exercise prudent judgment rather than chasing high-risk opportunities.\n\n`;
    enText += `Love and Relationships: For singles, romantic opportunities may arise in social settings or through mutual connections. Your charm and charisma are naturally elevated today, attracting potential partners. Those in committed relationships can benefit from open communication and planning shared future experiences together.\n\n`;
    enText += `Health and Wellness: Your physical condition remains robust. This is an excellent day for exercise, outdoor activities, or starting new wellness routines. Channel this positive energy into maintaining healthy habits.\n\n`;
    enText += `Overall, the ${zodiacEn} enjoys a day of favorable conditions. Seize the opportunities that present themselves today.`;
  } else if (verdict === '降低') {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Proceed with Caution\n\n`;
    enText += `The ${zodiacEn} faces challenging celestial influences today, requiring careful navigation of affairs and a generally conservative approach. While the energy may feel restrictive, this period offers valuable lessons in patience and strategic restraint.\n\n`;
    enText += `Career and Work: Professional matters may encounter obstacles or delays today. Interpersonal dynamics could be tense, making it wise to maintain a low profile and avoid confrontations. Focus on completing routine tasks competently rather than pursuing ambitious projects. Double-check all documents for errors.\n\n`;
    enText += `Financial Fortune: Guard your resources carefully today. Impulsive spending or high-risk investments are strongly discouraged. Prioritize paying existing bills and debts rather than taking on new financial obligations.\n\n`;
    enText += `Love and Relationships: Relationships require extra attention and sensitivity. Married individuals should avoid getting too close to members of the opposite sex. Single ${zodiacEn} may find romantic prospects subdued today.\n\n`;
    enText += `Health and Wellness: Pay attention to your physical well-being. Prioritize adequate rest, maintain a balanced diet, and avoid strenuous activities. This challenging period is temporary; maintaining composure now will position you favorably when circumstances improve.`;
  } else {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Steady Progress\n\n`;
    enText += `The ${zodiacEn} can expect a balanced and steady day, with no dramatic shifts in fortune but consistent progress across various life areas. This stable energy provides an ideal foundation for maintaining routines, organizing thoughts, and preparing for future opportunities.\n\n`;
    enText += `Career and Work: Your professional activities will proceed smoothly without major obstacles. This is a productive day for handling daily responsibilities and maintaining the momentum of ongoing projects. Focus on refining your current approach and building upon established foundations.\n\n`;
    enText += `Financial Fortune: Your financial situation remains stable today. This is an excellent time for financial housekeeping: reviewing budgets, tracking expenses, and planning savings strategies.\n\n`;
    enText += `Love and Relationships: For those in relationships, today offers opportunities to strengthen bonds through small gestures of care. Single ${zodiacEn} may find that romantic opportunities are modest but present.\n\n`;
    enText += `Health and Wellness: Maintain your current health routines without making dramatic changes. Every small step forward contributes to larger goals over time. Patience and persistence are your allies.`;
  }

  return enText;
}

/**
 * 生成幸运数字（基于日期Hash）
 */
function generateLuckyNumber(dateStr, zodiacKey) {
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (hash + zodiacKey.length) % 9 + 1;
  return base;
}

/**
 * 生成幸运方位
 */
function generateLuckyDirection(dizhi) {
  const directionMap = { '子': '正北', '丑': '东北', '寅': '东北', '卯': '正东', '辰': '东南', '巳': '东南', '午': '正南', '未': '西南', '申': '西南', '酉': '正西', '戌': '西北', '亥': '西北' };
  return directionMap[dizhi] || '正北';
}

/**
 * 生成六合生肖
 */
function generatePairSign(sign) {
  return LIUHE[sign] || '龙';
}

/**
 * 生成金句
 * 优先级：节日 > 节气 > 顺序循环（100条，每生肖按索引错开）
 * @param {string} dateStr - 日期 YYYY-MM-DD
 * @param {string} [zodiacKey] - 可选生肖key；有则按生肖错开选金句，无则返回共享金句
 */
function generateDailyQuote(dateStr, zodiacKey) {
  const solarTerm = getSolarTerm(dateStr);
  const festival = getFestival(dateStr);

  if (festival) {
    return FESTIVAL_QUOTES[festival] || festival;
  }
  if (solarTerm) {
    return SOLAR_TERM_QUOTES[solarTerm] || `节气更迭，顺应天时。`;
  }

  // 顺序循环：从 epoch 到 date 的天数 % 100 = 今日金句序号
  const epoch = new Date('2026-01-01');
  const current = new Date(dateStr);
  const daysSinceEpoch = Math.floor((current - epoch) / (24 * 60 * 60 * 1000));
  let idx = Math.abs(daysSinceEpoch) % BASE_QUOTES.length;

  // 有生肖key时，用生肖在列表中的索引做偏移，使每生肖金句不同
  if (zodiacKey) {
    const zodiacIndex = ZODIAC_LIST.findIndex(z => z.key === zodiacKey);
    idx = (idx + zodiacIndex) % BASE_QUOTES.length;
  }

  return BASE_QUOTES[idx];
}

/**
 * 更新 zodiac-data.js
 * 修复：在 "default" 块之前插入新日期数据，避免大括号计数 bug 导致 default 键名截断
 */
function updateDataFile(date, fortunes) {
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  // 生成JS格式的日期数据块
  const blockLines = ZODIAC_LIST.map(z => {
    const f = fortunes[z.key];
    // 安全转义 quote 字段中的特殊字符（双引号、反斜杠等）
    const safeQuote = (f.quote || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const safeQuoteEn = (f.quoteEn || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `    "${z.key}":     { score: ${f.score}, color: "${WUXING_COLORS[z.element]?.hex || '#D4AF37'}", colorName: "${WUXING_COLORS[z.element]?.name || '金色'}", number: ${f.luckyNum}, direction: "${f.direction}", pair: "${f.pair}",     good: ${JSON.stringify(f.yi)},        avoid: ${JSON.stringify(f.ji)},       quote: "${safeQuote}", quoteEn: "${safeQuoteEn}" }`;
  });

  const newBlock = `  "${date}": {\n${blockLines.join(',\n')}\n  },\n`;

  // 检查是否已有该日期数据 —— 用更精确的正则匹配整个日期键值块
  const escapedDate = date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dateBlockRegex = new RegExp(`  "${escapedDate}":\\s*\\{[\\s\\S]*?\\n  \\},?\\n?`);
  const match = content.match(dateBlockRegex);

  if (match) {
    // 替换已有数据块
    content = content.replace(match[0], newBlock);
  } else {
    // 修复：在 "default" 块之前插入新日期数据（不再遍历 default 块内部，彻底避开大括号计数 bug）
    const defaultPos = content.indexOf('"default"');
    if (defaultPos > 0) {
      // 找到 default 之前的最后一个 }, 在其后插入
      const beforeDefault = content.slice(0, defaultPos);
      const lastBrace = beforeDefault.lastIndexOf('},');
      if (lastBrace > 0) {
        const insertPos = lastBrace + 2; // 跳过 },
        content = content.slice(0, insertPos) + '\n\n' + newBlock + content.slice(insertPos);
      } else {
        // 降级：直接在 default 之前插入
        content = content.slice(0, defaultPos) + '\n' + newBlock + '\n  ' + content.slice(defaultPos);
      }
    }
  }

  fs.writeFileSync(DATA_FILE, content, 'utf8');

  // 验证：确保目标日期键确实写入，内容不为空，且没有明显的语法错误标记
  try {
    const hasDate = content.includes(`"${date}"`) && content.includes(`"${date}": {`);
    if (!hasDate) {
      throw new Error(`日期 ${date} 未正确写入 zodiac-data.js`);
    }
    // 基础语法检查：确保大括号配对
    const openBrace = (content.match(/{/g) || []).length;
    const closeBrace = (content.match(/}/g) || []).length;
    if (openBrace !== closeBrace) {
      throw new Error(`大括号不匹配（{ ${openBrace} vs } ${closeBrace}）`);
    }
    // 新增：检查 "default" 键名完整性
    if (!content.includes('"default":')) {
      throw new Error('"default" 键名被截断');
    }
    // 检查文件不是空的
    if (content.trim().length < 50) {
      throw new Error('文件内容过短，可能生成失败');
    }
    console.log('✅ zodiac-data.js 已更新并验证通过');
  } catch (err) {
    console.error(`❌ zodiac-data.js 验证失败: ${err.message}`);
    console.error('   从 git 恢复原始文件...');
    try { execSync('git checkout zodiac/js/zodiac-data.js', { cwd: PROJECT_ROOT }); } catch (_) {}
    throw new Error('zodiac-data.js 验证失败，已从 git 恢复');
  }
}

/**
 * 保存SEO内容JSON
 */
function saveSeoContent(date, fortunesCN, fortunesEN, ganzhi) {
  if (!fs.existsSync(SEO_DIR)) {
    fs.mkdirSync(SEO_DIR, { recursive: true });
  }

  const data = {
    date,
    generatedAt: new Date().toISOString(),
    ganzhi: {
      ganzhi: ganzhi.ganzhi,
      wuxing: ganzhi.wuxing,
      tiangan: ganzhi.tiangan,
      dizhi: ganzhi.dizhi,
    },
    fortunes: fortunesCN,
    fortunesEn: fortunesEN,
  };

  fs.writeFileSync(
    path.join(SEO_DIR, `${date}.json`),
    JSON.stringify(data, null, 2),
    'utf8'
  );
  console.log(`✅ SEO内容已保存: zodiac/seo-content/${date}.json`);
}

/**
 * 生成12个静态详情页（永久URL，数据内嵌，无date参数）
 * v3.0 新增 — 解决日期参数URL导致SEO权重分散问题
 */
/**
 * 将 Markdown 转为 HTML（用于 EN 内容排版）
 * - 去掉 emoji
 * - ### → <h3>, ** → <strong>, * → <em>
 * - \n\n → 分段 <p>
 */
function markdownToHtml(text) {
  // 1. 预处理：清理残留 Markdown 符号
  // Strip emojis
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
  // Remove leading # symbols (####, ###, ##, #) at start of line
  text = text.replace(/^#+\s*/gm, '');
  // Remove markdown asterisks for bold/italic (**text**, *text*, ***)
  text = text.replace(/\*{1,3}([^*]+?)\*{1,3}/g, '$1');
  // Remove remaining asterisks that are just loose symbols
  text = text.replace(/(?<!\w)\*+\s*/g, '');
  // Remove HTML tags that might slip through (unlikely but safe)
  text = text.replace(/<[^>]+>/g, '');
  // Clean up multiple spaces
  text = text.replace(/ {2,}/g, ' ');
  // Remove trailing whitespace from lines
  text = text.replace(/[ \t]+$/gm, '');

  // 2. 统一换行格式：单换行→空格，多换行→双换行（便于split）
  // Collapse single newlines within a paragraph to space
  text = text.replace(/([^\n])\n([^\n])/g, '$1 $2');
  // Collapse triple+ newlines to double newline
  text = text.replace(/\n{3,}/g, '\n\n');

  // 3. Split into blocks by double newline
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

  const htmlBlocks = blocks.map(block => {
    block = block.trim();
    if (!block) return '';

    // Section header detection: "Career:" or "Career / Work:" style (plain text, no asterisks)
    const headerMatch = block.match(/^([A-Z][A-Za-z\s\/\-]+?):\s*(.*)$/s);
    if (headerMatch && headerMatch[2].length < 300) {
      // Likely a header + content
      const header = headerMatch[1].trim();
      const content = headerMatch[2].trim();
      return `<h3>${header}</h3><p>${content}</p>`;
    }

    // Regular paragraph
    return `<p>${block}</p>`;
  });

  return htmlBlocks.join('\n');
}

/**
 * 强制将连续英文文本按句子分组为 4-6 段
 * 用于 AI 翻译输出不分段时的兜底处理
 */
function forceEnglishParagraphs(text, targetParagraphs = 5) {
  // 已经有段落分隔的直接返回
  if (/\n\s*\n/.test(text)) return text.trim();

  // 按句子边界切分（. ! ? 后跟空格或大写字母或结尾）
  const sentences = text.match(/[^.!?]*[.!?]+[\s]*/g) || [text];
  if (sentences.length <= targetParagraphs) return text.trim();

  // 按 targetParagraphs 均匀分组
  const perGroup = Math.ceil(sentences.length / targetParagraphs);
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += perGroup) {
    paragraphs.push(sentences.slice(i, i + perGroup).join(' ').trim());
  }
  return paragraphs.join('\n\n');
}

function inlineMd(text) {
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (single asterisk, avoid ** leftovers)
  text = text.replace(/(^|[^*])\*([^*]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
  // Single newlines within block → <br>
  text = text.replace(/\n/g, '<br>');
  return text;
}

function generateStaticDetailPages(dateStr, fortunesCN, fortunesEN, ganzhi) {
  const STATIC_DIR = path.join(PROJECT_ROOT, 'zodiac');

  // 中英文映射
  const SIGN_NAMES_ZH = { rat:'鼠', ox:'牛', tiger:'虎', rabbit:'兔', dragon:'龙', snake:'蛇', horse:'马', goat:'羊', monkey:'猴', rooster:'鸡', dog:'狗', pig:'猪' };
  const DIRECTION_EN = { '正南':'South', '正北':'North', '正东':'East', '正西':'West', '东南':'Southeast', '东北':'Northeast', '西南':'Southwest', '西北':'Northwest' };
  const COLOR_EN = { '红色':'Red', '绿色':'Green', '蓝色':'Blue', '黄色':'Yellow', '紫色':'Purple', '橙色':'Orange', '白色':'White', '黑色':'Black', '粉色':'Pink', '金色':'Gold', '银色':'Silver', '棕色':'Brown' };
  const VERDICT_EN = { '上升':'Rising luck', '降低':'Challenging day', '一般':'Balanced day', '喜忧参半':'Mixed fortune', '稳定':'Stable energy' };

  // 格式化日期
  const [y, m, d] = dateStr.split('-');
  const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const WEEKDAYS_CN = ['周日','周一','周二','周三','周四','周五','周六'];
  const WEEKDAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateZh = `${y}年${parseInt(m)}月${parseInt(d)}日 · ${WEEKDAYS_CN[dt.getDay()]}`;
  const dateEn = `${MONTHS_EN[dt.getMonth()]} ${parseInt(d)}, ${y} · ${WEEKDAYS_EN[dt.getDay()]}`;

  // YIJI_MAP 和 QUOTE_MAP（同 zodiac-detail.html，保持一致）
  const YIJI_MAP = {
    '祈福':'Receive Blessings',   '祭祀':'Honor Ancestors',
    '出行':'Going Out',            '会友':'Meet Friends',
    '栽种':'Plant & Garden',      '入学':'Start Learning',
    '求职':'Job Search',           '签约':'Sign Agreements',
    '开业':'Launch Projects',      '交易':'Make Deals',
    '修身':'Self-Improvement',     '表白':'Express Feelings',
    '文艺':'Creative Arts',        '创作':'Creative Work',
    '求财':'Money Opportunities',  '拜访':'Visit Others',
    '嫁娶':'Relationships',        '创新':'Innovation',
    '变革':'Embrace Change',       '理财':'Financial Planning',
    '储蓄':'Save & Accumulate',    '社交':'Social Connections',
    '聚会':'Gatherings',           '休养':'Rest & Recharge',
    '家庭':'Home & Family',        '搬家':'Move & Rearrange',
    '沐浴':'Refresh Yourself',     '动土':'Construction',
    '修造':'Renovation',          '安床':'Bedroom Setup',
    '纳财':'Accumulate Wealth',    '借贷':'Loans & Debt',
    '安葬':'Let Go & Release',     '诉讼':'Legal Matters',
    '谈判':'Negotiations',         '投资':'Investments',
    '合伙':'Partnerships',        '迁徙':'Relocation',
    '争斗':'Conflict',             '口舌':'Gossip & Missteps',
    '投机':'Speculation',          '赌博':'Gambling',
    '冒进':'Reckless Moves',       '变动':'Major Changes',
    '消费':'Spending',             '扩张':'Expansion',
    '争执':'Arguments',            '冲突':'Conflict',
  };
  const QUOTE_MAP = {
    // ── BASE_QUOTES 全量翻译（100 条） ──
    // 一、成长与坚持（1-20）
    '慢慢来，比较快':'Slow and steady wins the race.',
    '每一步都算数':'Every step counts.',
    '坚持就是胜利':'Persistence is victory.',
    '今天比昨天好':'Today is better than yesterday.',
    '种子终会发芽':'Every seed will sprout in time.',
    '水滴石穿的力量':'Dripping water hollows out stone.',
    '不积跬步无以至千里':'A journey of a thousand miles begins with a single step.',
    '努力终有回报':'Hard work always pays off.',
    '每天进步一点点':'A little progress each day adds up.',
    '时间会给出答案':'Time will reveal the answer.',
    '慢慢走，沿途有风景':'Slow down and enjoy the scenery along the way.',
    '你比想象中坚强':'You are stronger than you think.',
    '不怕慢，只怕停':'It is not the speed that matters, but the persistence.',
    '成长需要耐心':'Growth requires patience.',
    '所有坚持都有意义':'Every ounce of persistence has meaning.',
    '熬过黑夜就是黎明':'Endure the night, and dawn will come.',
    '扎根才能枝繁叶茂':'Deep roots lead to lush branches.',
    '沉淀是为了爆发':'Stillness prepares for the breakthrough.',
    '日拱一卒无有尽':'Every small step forward counts.',
    '功不唐捐终入海':'Nothing you do is ever truly wasted.',
    // 二、希望与光明（21-40）
    '阳光总在风雨后':'After rain comes sunshine.',
    '黑暗尽头是光明':'At the end of darkness lies light.',
    '明天会更好':'Tomorrow will be better.',
    '希望永不灭':'Hope never dies.',
    '向阳而生':'Grow toward the light.',
    '心若向阳无畏悲伤':'With a sunny heart, fear no sorrow.',
    '光就在前方':'The light is just ahead.',
    '拨开云雾见月明':'Clear the clouds and the moon will shine.',
    '寒冬过后是春天':'After winter comes spring.',
    '黎明前的夜最黑':'The darkest hour is just before dawn.',
    '总有一束光为你亮':'There is always a light shining for you.',
    '雨后会天晴':'The sky will clear after the rain.',
    '星光不问赶路人':'Starlight guides the traveler without question.',
    '万物皆有裂痕':'Everything has cracks in it.',
    '那是光照进来的地方':'That is how the light gets in.',
    '心有明灯不迷茫':'With an inner light, you will never feel lost.',
    '追光的人终会光芒万丈':'Those who chase the light will eventually shine.',
    '破茧才能成蝶':'Break through to become who you are meant to be.',
    '涅槃重生':'Out of the ashes, rise again.',
    '风雨过后见彩虹':'After every storm, the colors return.',
    // 三、心态与心境（41-60）
    '心宽路就宽':'A broad mind finds a broad road.',
    '放下便是拥有':'To let go is to truly possess.',
    '随缘自在':'Go with the flow, find peace within.',
    '心静自然凉':'A calm heart naturally cools the mind.',
    '知足常乐':'Contentment brings lasting happiness.',
    '平常心是道':'An ordinary mind is the way to peace.',
    '一切都是最好的安排':'Everything unfolds as it should.',
    '顺其自然':'Let nature take its course.',
    '心安即是归处':'Inner peace is home wherever you are.',
    '从容面对一切':'Face everything with grace.',
    '不争不抢自有岁月打赏':'What is meant for you will not pass you by.',
    '慢下来，感受生活':'Slow down and savor life.',
    '内心丰盈者独行也众':'The truly rich in spirit are never alone.',
    '心若不动风又奈何':'If the heart stays still, no wind can shake it.',
    '淡定从容是最好的状态':'Calm composure is the best state of being.',
    '修心养性':'Cultivate the heart and nourish the spirit.',
    '一念放下万般自在':'One thought of letting go brings endless freedom.',
    '心简单世界就简单':'A simple heart sees a simple world.',
    '温柔对待这个世界':'Treat the world with gentleness.',
    '与自己和解':'Make peace with yourself.',
    // 四、行动与勇气（61-80）
    '勇敢出发':'Set off bravely.',
    '想做就去做':'If you want it, go for it.',
    '行动是最好的答案':'Action is the best answer.',
    '迈出第一步':'Take the first step.',
    '趁年轻去追梦':'Chase your dreams while you are young.',
    '乘风破浪':'Ride the wind and break the waves.',
    '逆风翻盘':'Turn the tide against the wind.',
    '越挫越勇':'The more setbacks, the stronger you become.',
    '敢于重新开始':'Dare to start over.',
    '去成为你想成为的人':'Go become the person you want to be.',
    '不要等，现在就出发':'Do not wait. Set off now.',
    '行动力决定未来':'Your actions shape your future.',
    '去做就对了':'Just do it.',
    '勇敢的人先享受世界':'The brave enjoy the world first.',
    '路在脚下':'The road is beneath your feet.',
    '向前看别回头':'Keep looking forward, never back.',
    '敢于突破自己':'Dare to push beyond your limits.',
    '逆风飞翔':'Fly against the wind.',
    '迎难而上':'Face challenges head-on.',
    '勇者无畏':'The fearless know no fear.',
    // 五、自然与哲理（81-100）
    '道法自然':'Follow the way of nature.',
    '万物皆有定时':'Everything has its season.',
    '春生夏长秋收冬藏':'Spring grows, summer flourishes, autumn harvests, winter rests.',
    '顺应天时':'Follow the rhythm of the seasons.',
    '花开有时':'Every flower blooms in its own time.',
    '草木有本心':'Every plant has its own nature.',
    '天地有大美':'There is great beauty in heaven and earth.',
    '静水流深':'Still waters run deep.',
    '厚德载物':'Great virtue carries all things.',
    '上善若水':'The highest good is like water.',
    '大道至简':'The greatest truths are the simplest.',
    '返璞归真':'Return to your authentic self.',
    '天人合一':'Heaven and humanity are one.',
    '万物并育而不相害':'All things grow together without harming one another.',
    '顺势而为':'Go with the natural flow.',
    '风物长宜放眼量':'Take the long view.',
    '守得云开见月明':'Wait patiently, and the moon will reveal itself.',
    '岁月从不败美人':'Time is kind to those who live well.',
    '人间值得':'This world is worth it.',
    '未来可期':'The future is full of promise.',
    // ── 特殊判定金句 ──
    '静待时机，贵人暗助。':'Patience rewards; hidden allies step forward.',
    '稳中求进，忌急躁。':'Advance steadily; resist the urge to rush.',
    '机遇临门，乘势而上。':'An opportunity lands at your door—seize it.',
    '韬光养晦，厚积薄发。':'Gather your strength quietly; breakthrough is near.',
    '龙腾四海，气势如虹。':'Power and momentum build; success is inevitable.',
    '灵蛇蜕皮，焕然一新。':'Shed the old; emerge renewed and transformed.',
    '马到成功，势不可挡。':'Victory charges in; nothing can stand in your way.',
    '温顺待机，贵人相助。':'Stay gentle and patient; benefactors will come.',
    '猴王智慧，灵活制胜。':'Be clever and adaptable; flexibility outwits rigidity.',
    '忠诚待人，福报自来。':'Loyalty to others returns as unexpected blessings.',
    '猪拱福门，平安是福。':'Fortune nudges the door; peace is its own reward.',
    '虎啸山林，王者归来。':'Regain your authority and command respect.',
    '贵人相扶，小有斩获。':'Your supporters bring meaningful wins today.',
    '稳中带进，时来运转。':'Steady momentum builds; fortune is turning your way.',
    '静待时机，蓄势待发。':'Wait for the right moment; your time is coming.',
    '桃花运佳，感情得意。':'Romantic energy peaks; connections deepen.',
    '龙行虎步，一路顺风。':'Walk with purpose and grace; things fall into place.',
    '静心养性，稳步前行。':'Center yourself; steady progress follows.',
    '马有远志，循序渐进。':'Think long-term; progress step by step.',
    '三合吉星，诸事顺遂。':'Harmonious celestial energy favors all you do.',
    '灵活变通，化解阻碍。':'Adapt and pivot; obstacles dissolve.',
    '精打细算，积少成多。':'Small, careful choices accumulate into big gains.',
    '狗年大旺，人缘爆棚。':'Social energy peaks; connections multiply.',
    '平安是福，知足常乐。':'Contentment is its own kind of wealth.',
    '风雨过后见彩虹。':'After every storm, the colors return.',
    '破茧才能成蝶。':"Break through to become who you're meant to be.",
    '涅槃重生。':'Out of the ashes, rise again.',
    '日拱一卒无有尽。':'Every small step forward counts.',
    '功不唐捐终入海。':'Nothing you do is ever truly wasted.',
    // 节气金句
    '小满未满，盈而不溢。':'Small gains, not yet full — abundance without overflow.',
  };
  function trYi(tag) { return YIJI_MAP[tag] || tag; }
  function trQuote(q) {
    // 1. 精确匹配
    if (QUOTE_MAP[q]) return QUOTE_MAP[q];
    // 2. 去掉末尾句号匹配
    const noPeriod = q.replace(/[。\.]$/, '');
    if (QUOTE_MAP[noPeriod]) return QUOTE_MAP[noPeriod];
    // 3. 去掉首尾空白匹配
    const trimmed = q.trim();
    if (QUOTE_MAP[trimmed]) return QUOTE_MAP[trimmed];
    // 4. 节气金句特殊处理（小满等）
    if (q.includes('小满')) return 'Small gains, not yet full — abundance without overflow.';
    // 5. 兜底返回原文
    return q;
  }

  // 评分→判定
  function getVerdict(score) {
    if (score >= 80) return '上升';
    if (score >= 60) return '稳定';
    if (score >= 50) return '一般';
    return '降低';
  }

  // 生成星级（四舍五入到最近整数，避免 ½ 符号在某些字体下显示异常）
  function renderStars(score) {
    const stars = Math.round(score / 20);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }

  ZODIAC_LIST.forEach(z => {
    const fc = fortunesCN[z.key];
    const fe = fortunesEN[z.key];
    if (!fc || !fe) return;

    const verdict = getVerdict(fc.score);
    const verdictEn = VERDICT_EN[verdict] || verdict;
    const dirEn = DIRECTION_EN[fc.direction] || fc.direction;
    const colorEn = COLOR_EN[fc.colorName] || fc.colorName;

    // 中文版页面内容
    const zhContent = buildDetailHTML({
      sign: z.key,
      signName: z.name,
      signNameEn: z.en,
      pageLang: 'zh',
      dateStr,
      dateZh,
      dateEn,
      fc,
      fe,
      verdict,
      verdictEn,
      dirEn,
      colorEn,
      dateZh,
      YIJI_MAP,
      QUOTE_MAP,
      trYi,
      trQuote,
      renderStars,
      DIRECTION_EN,
      COLOR_EN,
      dateStr,
      dateEn,
    }, false);

    // 英文版 FORTUNE_DATA：yi/ji/quote 全部翻译为英文（嵌入 HTML）
    const feTr = {
      ...fe,
      yi: fe.yi.map(trYi),
      ji: fe.ji.map(trYi),
      quote: trQuote(fe.quote),
    };

    // 英文版页面内容
    const enContent = buildDetailHTML({
      sign: z.key,
      signName: z.name,
      signNameEn: z.en,
      pageLang: 'en',
      dateStr,
      dateZh,
      dateEn,
      fc,
      fe: feTr,
      verdict,
      verdictEn,
      dirEn,
      colorEn,
      dateZh,
      YIJI_MAP,
      QUOTE_MAP,
      trYi,
      trQuote,
      renderStars,
      DIRECTION_EN,
      COLOR_EN,
      dateStr,
      dateEn,
    }, true);

    // 写文件：rat.html (中文) 和 rat-en.html (英文)
    const zhPath = path.join(STATIC_DIR, `${z.key}.html`);
    const enPath = path.join(STATIC_DIR, `${z.key}-en.html`);

    // zh 版：canonical=rat（无.html，Vercel cleanUrls 访问路径），hreflang=en→rat-en, zh-Hant→rat
    const zhHead = buildSeoHead(z, fc, fe, dateStr, dateZh, dateEn, verdictEn, dirEn, colorEn, z.key, `${z.key}-en`, false);
    fs.writeFileSync(zhPath, injectHead(zhContent, zhHead), 'utf8');

    // en 版：canonical=rat-en（无.html），hreflang=zh-Hant→rat, x-default→rat-en
    const enHead = buildSeoHead(z, fc, fe, dateStr, dateZh, dateEn, verdictEn, dirEn, colorEn, `${z.key}-en`, z.key, true);
    fs.writeFileSync(enPath, injectHead(enContent, enHead), 'utf8');

    console.log(`   ✅ ${z.name} / ${z.en}: ${z.key}.html + ${z.key}-en.html`);
  });

  console.log(`✅ 12个静态详情页已生成（永久URL，无date参数）`);
}

/**
 * 构建详情页 HTML 内容（不含 <head> SEO 标签）
 */
function buildDetailHTML(ctx, isEn) {
  const { sign, signName, signNameEn, pageLang, dateStr, dateZh, dateEn, fc, fe, verdict, verdictEn, dirEn, colorEn, YIJI_MAP, QUOTE_MAP, trYi, trQuote, renderStars, DIRECTION_EN, COLOR_EN } = ctx;
  const accent = '#D4AF37'; // 默认金色
  const rawContent = isEn ? fe.content : fc.content;
  // EN 内容走 markdownToHtml；CN 按【】分段落渲染
  let htmlContent;
  if (isEn) {
    htmlContent = markdownToHtml(rawContent);
  } else {
    // 按【段落标题】或 \n\n 分割，兼容两种分段方式
    const cnBlocks = rawContent.split(/(?=【)|\n\n/).filter(b => b.trim());
    htmlContent = cnBlocks.map(block => {
      const titleMatch = block.match(/^【([^】]+)】(.*)$/s);
      if (titleMatch) {
        return `<h3>${titleMatch[1]}</h3><p>${titleMatch[2].trim()}</p>`;
      }
      return `<p>${block.trim().replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  const active = isEn ? fe : fc;
  const goodTags = active.yi.map(g => `<span class="y-tag y-tag--good">${isEn ? trYi(g) : g}</span>`).join('');
  const badTags = active.ji.map(a => `<span class="y-tag y-tag--bad">${isEn ? trYi(a) : a}</span>`).join('');
  const shareTextEn = `${signNameEn} Chinese zodiac horoscope: ${fc.score}/100. Lucky number ${fc.luckyNum}, direction ${dirEn}, lucky color ${colorEn}. Good for ${active.yi.map(trYi).join(', ')}. Avoid ${active.ji.map(trYi).join(', ')}.`;
  const shareTextZh = `${signName}今日运势 ${fc.score}分 — ${fc.quote}`;

  // FAQ 数据（搜索意图导向，无日期）
  const faqData = isEn ? [
    { q: `What is the Chinese zodiac horoscope for ${signNameEn} today?`, a: `${signNameEn}'s horoscope today shows ${verdictEn.toLowerCase()}, with an overall score of ${fc.score}/100. Lucky number: ${fc.luckyNum}, direction: ${dirEn}, lucky color: ${colorEn}. Good for ${fc.yi.map(trYi).join(', ')}, avoid ${fc.ji.map(trYi).join(', ')}.` },
    { q: `Is today a good day for ${signNameEn} in career and work?`, a: `Based on the Chinese zodiac analysis, ${signNameEn}'s work energy today is ${verdict === '上升' ? 'highly favorable—take initiative.' : verdict === '降低' ? 'challenging—stay conservative.' : 'steady—follow your plan.'} Best approach: ${fc.yi[0] ? trYi(fc.yi[0]) + ' is favored.' : 'stay focused on routine tasks.'}` },
    { q: `What should ${signNameEn} avoid today according to Chinese astrology?`, a: `Overall energy for ${signNameEn} today is ${verdictEn.toLowerCase()}. Key advice: "${trQuote(fc.quote)}". Lucky number ${fc.luckyNum} and direction ${dirEn} can enhance your day. Avoid: ${fc.ji.map(trYi).join(', ')}.` }
  ] : [
    { q: `${signName}今日运势怎么样？`, a: `生肖${signName}今日运势${verdict === '上升' ? '上升' : verdict === '降低' ? '降低' : '平稳'}，综合评分 ${fc.score}/100。幸运数字 ${fc.luckyNum}，幸运方位 ${fc.direction}，幸运色 ${fc.colorName}。宜${fc.yi.join('、')}，忌${fc.ji.join('、')}。` },
    { q: `属${signName}今天适合做什么？`, a: `根据天干地支五行推算，今日生肖${signName}的工作运势${verdict === '上升' ? '受吉星扶助，适合主动出击' : verdict === '降低' ? '不利因素较多，宜静不宜动' : '平稳推进，按计划行事'}。建议${fc.yi[0] ? '今日宜' + fc.yi[0] : '保持专注'}。` },
    { q: `${signName}今日财运和感情运势分析`, a: `今日生肖${signName}的整体能量${verdict === '上升' ? '上升' : verdict === '降低' ? '降低' : '稳定'}，具体运势详见上方详细解读。综合建议：${fc.quote}。配合幸运数字 ${fc.luckyNum} 和幸运方位 ${fc.direction} 行动，效果更佳。` }
  ];

  const faqItems = faqData.map(f => `<details class="faq-item"><summary class="faq-item__q">${f.q}</summary><div class="faq-item__a">${f.a}</div></details>`).join('');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });

  const blogLinks = isEn ? (fc.blogLinksEN || []) : (fc.blogLinksCN || []);
  const blogCards = blogLinks.map(b => `<a href="${b.url}" class="blog-link-card"><div class="blog-link-card__icon">&#9654;</div><div class="blog-link-card__content"><div class="blog-link-card__title">${b.title}</div><div class="blog-link-card__arrow">→</div></div></a>`).join('');

  // ── 工具导流区（静态页）──
  const toolsSection = `
    <div class="seo-divider">
      <span class="seo-divider__line"></span>
      <span class="seo-divider__text">${isEn ? 'WANT TO GO DEEPER?' : '想深入了解？'}</span>
      <span class="seo-divider__line"></span>
    </div>
    <section class="content-section">
      <div class="tools-grid">
        <a href="/#free-bazi" class="tool-card">
          <span class="tool-card__icon"></span>
          <div class="tool-card__info">
            <div class="tool-card__name">${isEn ? 'Your Personal BaZi Chart' : '你的八字命盘'}</div>
            <div class="tool-card__desc">${isEn ? 'Based on your exact birth date' : '基于你的出生日期'}</div>
          </div>
          <span class="tool-card__arrow">→</span>
        </a>
        <a href="/five-elements-test" class="tool-card">
          <span class="tool-card__icon"></span>
          <div class="tool-card__info">
            <div class="tool-card__name">${isEn ? 'Five Elements Test' : '五行人格测试'}</div>
            <div class="tool-card__desc">${isEn ? 'Discover your personality type' : '发现你的性格类型'}</div>
          </div>
          <span class="tool-card__arrow">→</span>
        </a>
        <a href="/soulmate-calculator" class="tool-card">
          <span class="tool-card__icon"></span>
          <div class="tool-card__info">
            <div class="tool-card__name">${isEn ? 'Soulmate Compatibility' : '爱情配对'}</div>
            <div class="tool-card__desc">${isEn ? 'Check your zodiac love match' : '查看你的爱情配对'}</div>
          </div>
          <span class="tool-card__arrow">→</span>
        </a>
      </div>
    </section>`;

  // ── 配对导流区（静态页）──
  // 37 个 key 全部按字母序排列，与 [sign, s].sort().join('-') 查找一致
  // 代码实测：69 次 lookup / 0 miss / 37 key 全命中 / 0 冗余 / 0 分数冲突
  const pairScores = {
    // 三合/六合（高分）
    'dog-horse': 86, 'dog-rabbit': 84, 'dog-tiger': 86,
    'dragon-monkey': 85, 'dragon-rat': 86, 'dragon-rooster': 84,
    'goat-horse': 84, 'goat-pig': 85, 'goat-rabbit': 87,
    'horse-tiger': 89, 'monkey-rat': 86, 'monkey-snake': 83,
    'ox-rat': 88, 'ox-rooster': 87, 'ox-snake': 85,
    'pig-rabbit': 85, 'pig-tiger': 85, 'rooster-snake': 86,
    // 相冲/相害（低分）
    'dog-dragon': 31, 'dog-goat': 36, 'dog-ox': 36, 'dog-rooster': 35,
    'dragon-pig': 36, 'dragon-rabbit': 35, 'goat-ox': 36, 'goat-rat': 35,
    'horse-ox': 33, 'horse-rabbit': 38, 'horse-rat': 32,
    'monkey-pig': 34, 'monkey-tiger': 30, 'pig-pig': 32, 'pig-snake': 30,
    'rabbit-rat': 38, 'rabbit-rooster': 32, 'rooster-rooster': 30, 'snake-tiger': 34,
  };

  function buildPairCard(signKey, score) {
    var meta = ZODIAC_LIST.find(function(z) { return z.key === signKey; });
    var name = isEn ? meta.en : meta.name;
    var scoreClass = score >= 80 ? 'pair-good' : score >= 50 ? 'pair-mid' : 'pair-bad';
    return '<div class="pair-card ' + scoreClass + '">' +
      '<span class="pair-card__name">' + name + '</span>' +
      '<span class="pair-card__score">' + score + '%</span>' +
    '</div>';
  }

  var bestMatches = {
    rat: ['ox', 'dragon', 'monkey'], ox: ['rat', 'snake', 'rooster'],
    tiger: ['horse', 'dog', 'pig'], rabbit: ['goat', 'pig', 'dog'],
    dragon: ['rat', 'monkey', 'rooster'], snake: ['ox', 'rooster', 'monkey'],
    horse: ['tiger', 'dog', 'goat'], goat: ['rabbit', 'pig', 'horse'],
    monkey: ['rat', 'dragon', 'snake'], rooster: ['ox', 'dragon', 'snake'],
    dog: ['tiger', 'horse', 'rabbit'], pig: ['rabbit', 'tiger', 'goat'],
  };
  var worstMatches = {
    rat: ['horse', 'goat', 'rabbit'], ox: ['horse', 'goat', 'dog'],
    tiger: ['monkey', 'snake'], rabbit: ['rooster', 'dragon', 'rat'],
    dragon: ['dog', 'rabbit', 'pig'], snake: ['pig', 'tiger'],
    horse: ['rat', 'ox', 'rabbit'], goat: ['ox', 'rat', 'dog'],
    monkey: ['tiger', 'pig'], rooster: ['rabbit', 'dog', 'rooster'],
    dog: ['dragon', 'rooster', 'ox'], pig: ['snake', 'monkey', 'pig'],
  };

  var bestCards = '', worstCards = '';
  var bestList = bestMatches[sign] || [];
  var worstList = worstMatches[sign] || [];

  bestList.forEach(function(s) {
    var key = [sign, s].sort().join('-');
    var sc = pairScores[key] || 85;
    bestCards += buildPairCard(s, sc);
  });
  worstList.forEach(function(s) {
    var key = [sign, s].sort().join('-');
    var sc = pairScores[key] || 35;
    worstCards += buildPairCard(s, sc);
  });

  var pairCardsHtml = '';
  if (bestList.length || worstList.length) {
    pairCardsHtml += '<div class="pair-row">';
    if (bestList.length) {
      pairCardsHtml += '<div class="pair-col"><div class="pair-group__label">' + (isEn ? 'BEST MATCHES' : '最佳配对') + '</div><div class="pair-col__cards">' + bestCards + '</div></div>';
    }
    if (worstList.length) {
      pairCardsHtml += '<div class="pair-col"><div class="pair-group__label">' + (isEn ? 'PROCEED WITH CAUTION' : '需留意') + '</div><div class="pair-col__cards">' + worstCards + '</div></div>';
    }
    pairCardsHtml += '</div>';
  }

  var pairSection = '\
    <div class="seo-divider">\
      <span class="seo-divider__line"></span>\
      <span class="seo-divider__text">' + (isEn ? 'CHECK YOUR LOVE MATCH' : '查看配对指数') + '</span>\
      <span class="seo-divider__line"></span>\
    </div>\
    <section class="content-section">\
      <div class="tools-grid pair-grid">\
        ' + pairCardsHtml + '\
      </div>\
    </section>';

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'zh-Hant'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <!-- SEO 标签由 generateStaticDetailPages 动态注入 -->
  <link rel="stylesheet" href="css/zodiac-daily.css">
  <script src="../js/tool-share.js"></script>
  <script src="js/share-card.js"></script>
  <script>
    var ZODIAC_BG = {
      rat:'linear-gradient(165deg,#0a1628,#102a43,#163e5f,#1a4a6b)',
      ox:'linear-gradient(160deg,#071a12,#0d2818,#143d26,#1a5035)',
      tiger:'linear-gradient(155deg,#1a0c08,#2d1408,#401808,#551c08)',
      rabbit:'linear-gradient(170deg,#180a14,#280e20,#38122c,#481638)',
      dragon:'linear-gradient(150deg,#1a1400,#332200,#4d3000,#663e00)',
      snake:'linear-gradient(160deg,#12081a,#1c0c30,#261046,#30145c)',
      horse:'linear-gradient(155deg,#1a0608,#33090c,#4c0c10,#650f14)',
      goat:'linear-gradient(175deg,#14141a,#20202c,#2c2c3e,#383850)',
      monkey:'linear-gradient(162deg,#061418,#0c242c,#123440,#184454)',
      rooster:'linear-gradient(168deg,#1a1008,#331c10,#4d2818,#663420)',
      dog:'linear-gradient(163deg,#1a1400,#2d2000,#403000,#533e00)',
      pig:'linear-gradient(170deg,#0a0a14,#10102a,#1a1a40,#242454)',
    };
    var FORTUNE_DATA = ${JSON.stringify({ sign, cn: fc, en: fe, quote: fc.quote })};
  </script>
</head>
<body class="detail-page-body">
  <div class="detail-bg"></div>
  <header class="detail-nav">
    <a class="detail-nav__back" href="/zodiac/zodiac-daily/" id="backLink">${isEn ? '← Back to Horoscope' : '← 返回运势首页'}</a>
    <div class="detail-lang-switch">
      <a href="/zodiac/${sign}/" style="color:${isEn ? 'rgba(255,255,255,0.5)' : '#D4AF37'};text-decoration:none;font-weight:${isEn ? '400' : '600'};font-size:0.85rem;">中</a>
      <a href="/zodiac/${sign}-en/" style="color:${isEn ? '#D4AF37' : 'rgba(255,255,255,0.5)'};text-decoration:none;font-weight:${isEn ? '600' : '400'};font-size:0.85rem;margin-left:12px;">EN</a>
    </div>
  </header>
  <main class="detail-content-v5">
    <div class="detail-date-badge" id="dateBadge">${isEn ? dateEn : dateZh}</div>
    <div class="detail-layout">
      <div class="detail-layout__left">
        <div class="detail-card-left">
          <img class="detail-card-left__img" id="cardImg" src="images/${sign}.webp" alt="${isEn ? signNameEn : signName}" draggable="false">
          <div class="detail-card-left__overlay"></div>
          <div class="detail-card-left__glow"></div>
        </div>
      </div>
      <div class="detail-layout__right">
        <div class="detail-header">
          <h1 class="detail-header__name" id="cardName">${isEn ? signNameEn + ' Daily Horoscope — ' + dateStr : signName + '今日运势详解 — ' + dateStr}</h1>
          <div class="detail-header__score">
            <span class="detail-header__score-num" id="cardScore" style="color:${accent}">${fc.score}</span>
            <span class="detail-header__stars" id="cardStars">${renderStars(fc.score)}</span>
          </div>
        </div>
        <div class="detail-info-row" id="infoRow">
          <div class="info-chip"><span class="dot" style="background:${fc.color}"></span>${isEn ? 'Lucky Color' : '幸运色'} <strong>${isEn ? colorEn : fc.colorName}</strong></div>
          <div class="info-chip">${isEn ? 'Lucky Number' : '幸运数'} <strong>${fc.luckyNum}</strong></div>
          <div class="info-chip">${isEn ? 'Direction' : '方位'} <strong>${isEn ? dirEn : fc.direction}</strong></div>
        </div>
        <div class="detail-yiji" id="yijiRow">
          <div class="yiji-block yiji-block--good"><div class="yiji-block__hdr">${isEn ? 'Good for' : '宜'}</div><div class="yiji-block__tags">${goodTags}</div></div>
          <div class="yiji-block yiji-block--bad"><div class="yiji-block__hdr">${isEn ? 'Avoid' : '忌'}</div><div class="yiji-block__tags">${badTags}</div></div>
        </div>
        <blockquote class="detail-quote"><p id="quoteText">${isEn ? trQuote(fc.quote) : fc.quote}</p></blockquote>
      </div>
    </div>
    <div id="zodiac-share"></div>
    <div class="seo-divider">
      <span class="seo-divider__line"></span>
      <span class="seo-divider__text" id="dividerText">${isEn ? 'Daily Horoscope Reading' : '今日运势解读'}</span>
      <span class="seo-divider__line"></span>
    </div>
    <article class="seo-content" id="seoContent">
      <h2 id="seoTitle">${isEn ? signNameEn + ' Daily Horoscope — ' + verdictEn : '今日' + signName + '运势详解'}</h2>
      <div id="seoText">${htmlContent}</div>
    </article>
    <script type="application/ld+json">${jsonLd}</script>

    ${pairSection}

${toolsSection}

    <!-- Lucky Wallpaper Recommendation -->
    <div class="zodiac-wp-section" style="margin-top:32px;padding:24px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;text-align:center;">
      <h3 style="font-size:16px;color:#D4AF37;margin-bottom:16px;">${isEn ? 'Today\'s Lucky Wallpaper for ' + signNameEn : '今日' + signName + '幸运壁纸'}</h3>
      <div id="zodiac-detail-wp-grid" style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;"></div>
      <a href="/wallpaper" style="display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(212,175,55,0.15);color:#D4AF37;border:1px solid rgba(212,175,55,0.3);border-radius:6px;text-decoration:none;font-size:13px;">${isEn ? 'Browse All Wallpapers →' : '查看更多玄学壁纸 →'}</a>
    </div>
    <script src="/js/zodiac-detail-wallpaper.js" defer></script>

    <!-- 生肖百科（Evergreen Content，永远不变，SEO 锚定） -->
    <div class="seo-divider">
      <span class="seo-divider__line"></span>
      <span class="seo-divider__text">${isEn ? 'ZODIAC ENCYCLOPEDIA' : '生肖百科'}</span>
      <span class="seo-divider__line"></span>
    </div>
    <section class="content-section zodiac-evergreen">
      ${isEn ? ZODIAC_EVERGREEN[sign].en : ZODIAC_EVERGREEN[sign].zh}
    </section>

    <section class="faq-section" id="faqSection">
      <div class="faq-section__header">
        <h2 class="faq-section__title">${isEn ? 'Frequently Asked Questions' : '常见问题'}</h2>
        <p class="faq-section__subtitle">${isEn ? 'Common questions about ' + signNameEn + "'s horoscope today" : '关于' + signName + '今日运势的常见问题'}</p>
      </div>
      <div class="faq-list" id="faqList">${faqItems}</div>
    </section>

    ${blogCards ? `
    <section class="blog-links-section" id="blogLinksSection">
      <div class="blog-links-section__header">
        <h2 class="blog-links-section__title">${isEn ? 'Related Reading' : '相关阅读'}</h2>
        <p class="blog-links-section__subtitle">${isEn ? 'Explore more Chinese astrology insights' : '深入了解更多命理知识'}</p>
      </div>
      <div class="blog-links-list" id="blogLinksList">${blogCards}</div>
    </section>` : ''}

  </main>
  <script>
    var shareText = '${isEn ? shareTextEn.replace(/'/g, "\\'") : shareTextZh.replace(/'/g, "\\'")}';
    if (window.ToolShare) {
      window.ToolShare.render('zodiac-share', {
        label: '${isEn ? 'Share Your Horoscope' : '分享你的运势'}',
        text: shareText,
        download: {
          sign: '${sign}',
          lang: '${isEn ? 'en' : 'zh'}',
          data: {score: ${fc.score}, number: ${fc.luckyNum}, colorName: '${fc.colorName}', direction: '${fc.direction}', quote: '${(fc.quote || '').replace(/'/g, "\\'")}'}
        }
      });
    }
    // 背景渐变
    var bg = ZODIAC_BG['${sign}'] || ZODIAC_BG.rat;
    document.querySelector('.detail-bg').style.background = bg;
    // 防盗图
    document.addEventListener('contextmenu', function(e) {
      if (e.target.tagName === 'IMG') { e.preventDefault(); return false; }
    });
    document.addEventListener('dragstart', function(e) {
      if (e.target.tagName === 'IMG') { e.preventDefault(); return false; }
    });
    document.addEventListener('touchstart', function(e) {
      if (e.target.tagName === 'IMG' && e.touches.length === 1) {
        var t = e.target; t.style.pointerEvents = 'none';
        setTimeout(function() { t.style.pointerEvents = ''; }, 500);
      }
    }, { passive: true });
  </script>
</body>
</html>`;
}

/**
 * 构建 <head> SEO 标签
 */
function buildSeoHead(z, fc, fe, dateStr, dateZh, dateEn, verdictEn, dirEn, colorEn, canonicalPath, alternatePath, isEn) {
  // P1: 缩短 Title ≤55 字符，确保 Google 搜索结果完整显示
  const title = isEn
    ? `${z.en} Chinese Zodiac: Personality & Fortune — DaoEssentia`
    : `生肖${z.name}运势详解 - 性格与幸运 - DaoEssentia`;
  const firstYiEn = fc.yi.length > 0 ? trYi(fc.yi[0]) : 'various activities';
  // P2: Meta Description 命中长尾关键词（personality traits, lucky colors, compatible signs）
  const descEn = `${z.en} Chinese Zodiac personality traits: ${ZODIAC_TRAITS[z.name] || 'see full guide'}. Lucky colors, compatible signs, daily horoscope updated.`;
  const descZh = `生肖${z.name}运势详解：性格特质${ZODIAC_TRAITS[z.name] ? '（' + ZODIAC_TRAITS[z.name].replace(/, /g, '、') + '）' : ''}。幸运颜色、配对生肖、每日运势持续更新。`;
  const desc = isEn ? descEn : descZh;

  const canonicalUrl = `https://www.daoessentia.com/zodiac/${canonicalPath}`;
  const alternateUrl = `https://www.daoessentia.com/zodiac/${alternatePath}`;
  return `<title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${isEn ? canonicalUrl : alternateUrl}">
  <link rel="alternate" hreflang="zh-Hant" href="${isEn ? alternateUrl : canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${isEn ? canonicalUrl : alternateUrl}">`;
}

/**
 * 将 SEO <head> 内容注入到 HTML 模板中（替换占位符）
 */
function injectHead(html, seoHead) {
  // 替换 <!-- SEO 标签由 generateStaticDetailPages 动态注入 -->
  return html.replace(
    '<!-- SEO 标签由 generateStaticDetailPages 动态注入 -->',
    seoHead
  );
}

// 辅助：trYi 和 trQuote 需要在 buildSeoHead 之前定义（延迟引用）
function trYi(tag) {
  const M = {'祈福':'Receive Blessings','祭祀':'Honor Ancestors','出行':'Going Out','会友':'Meet Friends','栽种':'Plant & Garden','入学':'Start Learning','求职':'Job Search','签约':'Sign Agreements','开业':'Launch Projects','交易':'Make Deals','修身':'Self-Improvement','表白':'Express Feelings','文艺':'Creative Arts','创作':'Creative Work','求财':'Money Opportunities','拜访':'Visit Others','嫁娶':'Relationships','创新':'Innovation','变革':'Embrace Change','理财':'Financial Planning','储蓄':'Save & Accumulate','社交':'Social Connections','聚会':'Gatherings','休养':'Rest & Recharge','家庭':'Home & Family','搬家':'Move & Rearrange','沐浴':'Refresh Yourself','动土':'Construction','修造':'Renovation','安床':'Bedroom Setup','纳财':'Accumulate Wealth','借贷':'Loans & Debt','安葬':'Let Go & Release','诉讼':'Legal Matters','谈判':'Negotiations','投资':'Investments','合伙':'Partnerships','迁徙':'Relocation'};
  return M[tag] || tag;
}

// ════════════════════════════════════════════════════════════
// 主流程
// ════════════════════════════════════════════════════════════

async function main() {
  // 使用东八区日期，避免 UTC 跨天问题
  const dateStr = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  console.log(`\n🚀 开始生成 ${dateStr} 生肖运势...\n`);

  // 0️⃣ 重复生成检查：今日 SEO 文件已存在则跳过 AI 生成，但详情页仍需重新生成
  const seoFile = path.join(SEO_DIR, `${dateStr}.json`);
  let seoData = null;
  if (fs.existsSync(seoFile)) {
    console.log(`⚠️  ${dateStr}.json 已存在，跳过 AI 生成，但详情页仍会重新生成\n`);
    seoData = JSON.parse(fs.readFileSync(seoFile, 'utf8'));
  }

  // ① 获取完整四柱（paipan 引擎精确排盘，作为唯一数据源）
  // 直接传年月日数字，避免 Date 对象在不同时区环境下 getDate() 返回不同值
  const [y, mo, d] = dateStr.split('-').map(Number);
  const fourPillars = getDailyFourPillars(null, y, mo, d);
  
  // ①b 提取日柱信息作为 ganzhi 变量（废弃 calculateGanzhi 简化算法，避免数据不一致）
  const ganzhi = {
    ganzhi: fourPillars.day.ganzhi,
    wuxing: fourPillars.day.wuxing,
    tiangan: fourPillars.day.stem,
    dizhi: fourPillars.day.branch,
  };

  // ①c 用 paipan 精确日支算冲合害刑（不再用 calculateGanzhi 的简化日支，避免打分与AI内容矛盾）
  const relations = getRelations(fourPillars.day.branch);

  console.log('📅 今日黄历:');
  console.log(`   干支: ${ganzhi.ganzhi}（${ganzhi.wuxing}）`);
  console.log(`   冲: ${relations.chong}  |  六合: ${relations.he}  |  害: ${relations.hai}  |  三合: ${relations.sanhe.join(',')}`);
  console.log(`   四柱: ${fourPillars.year.ganzhi} ${fourPillars.month.ganzhi} ${fourPillars.day.ganzhi} ${fourPillars.hour.ganzhi}`);

  // ② 生成金句（节日/节气共享；金句池按生肖错开，每生肖不同）
  const solarTerm = getSolarTerm(dateStr);
  const festival = getFestival(dateStr);
  const sharedQuote = generateDailyQuote(dateStr); // 节日/节气共享
  console.log(`\n✨ 今日金句: ${solarTerm ? `[${solarTerm}] ${sharedQuote}` : festival ? `[节日] ${sharedQuote}` : sharedQuote}`);

  // ③ 生成12生肖运势
  console.log('\n✍️  生成中文运势:');
  const fortunesCN = {};
  for (const z of ZODIAC_LIST) {
    const f = await generateFortuneCN(z, ganzhi, relations, fourPillars);
    const luckyNum = generateLuckyNumber(dateStr, z.key);
    const direction = generateLuckyDirection(ganzhi.dizhi);
    const pair = generatePairSign(z.sign);
    const quote = generateDailyQuote(dateStr, z.key); // 每生肖单独金句

    // 获取生肖对应的五行颜色
    const wuxingColor = WUXING_COLORS[z.element] || { hex: '#D4AF37', name: '金色' };
    fortunesCN[z.key] = {
      ...f,
      luckyNum,
      direction,
      pair,
      quote,
      yi: f.yi,
      ji: f.ji,
      color: wuxingColor.hex,
      colorName: wuxingColor.name,
      // 博客导流（中文：/zh/blog/，英文：/blog/）
      blogLinksCN: (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
        url: `/zh/blog/${b.slug}`,
        title: b.titleCN,
      })),
      blogLinksEN: (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
        url: `/blog/${b.slug}`,
        title: b.titleEN,
      })),
    };

    console.log(`   ${z.name} ${z.sign}: ${f.verdict} | 幸运数${luckyNum} | ${direction} | ${pair} | 金句"${quote}" | ${f.content.length}字`);
  }

  // ④ 生成英文运势
  console.log('\n🌐 生成英文运势:');
  const fortunesEN = {};
  for (const z of ZODIAC_LIST) {
    const fortuneEN = await generateFortuneEN(z, fortunesCN[z.key], ganzhi);
    // 注入英文博客导流链接（/blog/ 前缀）
    fortuneEN.blogLinksEN = (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
      url: `/blog/${b.slug}`,
      title: b.titleEN,
    }));
    fortunesEN[z.key] = fortuneEN;
    console.log(`   ${z.en}: ${fortunesEN[z.key].verdict.slice(0, 40)}... (${fortunesEN[z.key].length} words)`);
  }

  // ⑤ 保存文件
  console.log('\n💾 保存文件...');
  saveSeoContent(dateStr, fortunesCN, fortunesEN, ganzhi);
  updateDataFile(dateStr, fortunesCN);

  // ⑥ 生成12个静态详情页（永久URL + SEO优化）— v3.0 新增
  console.log('\n🏗️  生成静态详情页（永久URL）...');
  try {
    generateStaticDetailPages(dateStr, fortunesCN, fortunesEN, ganzhi);
  } catch (err) {
    console.error(`❌ 详情页生成失败: ${err.message}`);
    throw err; // 向上传播，不让数据文件单独提交
  }

  // ⑦ Git指令
  console.log('\n📦 Git 提交指令:');
  console.log(`   git add zodiac/js/zodiac-data.js zodiac/seo-content/${dateStr}.json zodiac/rat.html zodiac/rat-en.html ... zodiac/pig-en.html`);
  console.log(`   git commit -m "chore: ${dateStr} daily horoscope + 12 static detail pages"`);
  console.log(`   git push`);
  console.log('\n✅ 生成完成！\n');
}

main().catch(console.error);
