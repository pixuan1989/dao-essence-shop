// scripts/generate-wallpaper-cards.cjs
// 为每张壁纸生成 1200x630 的 X 分享卡片图（壁纸居中，四周填品牌深色 #161630）
// 解决 X 把竖图壁纸强行裁成横卡导致内容被切的问题。
//
// 用法:
//   node scripts/generate-wallpaper-cards.cjs        → 增量：只生成缺失的
//   node scripts/generate-wallpapers.cjs --all      → 全量重生成
//
// 输出: images/wallpaper-cards/{id}-card.jpg
// 这些卡片图是静态资源，随仓库提交（和 images/blog/*-card.jpg 同模式）。
// 注意: 必须预先生成并提交，generate-wallpapers.cjs 只引用、不生成（Vercel 构建期无 ffmpeg）。

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'wallpapers.json');
const OUT_DIR = path.join(ROOT, 'images', 'wallpaper-cards');
const FFMPEG = 'ffmpeg';
const CONCURRENCY = 12;

function getImageUrl(wp) {
  return wp.original || wp.image || wp.thumb || wp.url || '';
}

function cardFile(id) {
  return path.join(OUT_DIR, id + '-card.jpg');
}

function runFfmpeg(srcUrl, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-loglevel', 'error',
      '-i', srcUrl,
      '-vf', 'scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:color=#161630',
      '-q:v', '4',
      outPath
    ];
    execFile(FFMPEG, args, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ wallpapers.json not found at', DATA_FILE);
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const jobs = list
    .filter(w => w && w.id && getImageUrl(w))
    .map(w => ({ id: w.id, url: getImageUrl(w) }));

  const total = jobs.length;
  if (total === 0) {
    console.log('No wallpapers to process.');
    return;
  }

  let idx = 0;
  let done = 0, skipped = 0, failed = 0;
  const t0 = Date.now();

  async function worker() {
    while (idx < jobs.length) {
      const job = jobs[idx++];
      const out = cardFile(job.id);
      if (fs.existsSync(out)) { skipped++; continue; }
      try {
        await runFfmpeg(job.url, out);
        done++;
      } catch (e) {
        failed++;
        console.error('\nFAIL', job.id, (e && e.message) ? e.message : e);
      }
      const processed = done + skipped + failed;
      const pct = Math.floor(processed / total * 100);
      process.stdout.write(`\r  ${pct}%  (gen ${done}, skip ${skipped}, fail ${failed})  ${processed}/${total}`);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅ wallpaper cards done in ${secs}s — generated ${done}, skipped ${skipped}, failed ${failed}`);
  if (failed > 0) process.exit(2);
}

main().catch(e => { console.error(e); process.exit(1); });
