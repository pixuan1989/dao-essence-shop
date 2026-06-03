// scripts/migrate-wallpapers-format.cjs
// 一次性迁移脚本：将 wallpapers.json 从旧格式（snake_case）转换为新格式（camelCase）
// 只改字段名，不删任何数据
//
// 用法: node scripts/migrate-wallpapers-format.cjs
// 完成后会自动备份原文件到 wallpapers.json.bak

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'wallpapers.json');
const BAK_FILE = path.join(ROOT, 'wallpapers.json.bak');

function migrate() {
  console.log('\n🔄 Migrating wallpapers.json field names...\n');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ wallpapers.json not found at', DATA_FILE);
    process.exit(1);
  }

  // 1. 备份原文件
  fs.copyFileSync(DATA_FILE, BAK_FILE);
  console.log('   📦 Backup saved to wallpapers.json.bak');

  // 2. 读取数据
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const wallpapers = JSON.parse(raw);

  let migrated = 0;
  let skipped = 0;

  const migratedData = wallpapers.map(function(wp, idx) {
    var changed = false;
    var newWp = Object.assign({}, wp); // 浅拷贝，保留所有原有字段

    // title_zh  → titleZh
    if (wp['title_zh'] !== undefined && wp['titleZh'] === undefined) {
      newWp.titleZh = wp['title_zh'];
      delete newWp['title_zh'];
      changed = true;
      console.log('   ✅ [' + wp.id + '] title_zh → titleZh');
    }

    // description_zh → descriptionZh
    if (wp['description_zh'] !== undefined && wp['descriptionZh'] === undefined) {
      newWp.descriptionZh = wp['description_zh'];
      delete newWp['description_zh'];
      changed = true;
      console.log('   ✅ [' + wp.id + '] description_zh → descriptionZh');
    }

    // tags → keywords (旧格式用 tags，新格式用 keywords)
    if (wp['tags'] !== undefined && wp['keywords'] === undefined) {
      newWp.keywords = wp['tags'];
      // 不删除 tags，保持兼容；生成脚本已兼容读取
      changed = true;
      console.log('   ✅ [' + wp.id + '] tags → keywords (kept tags for compatibility)');
    }

    // tags_zh → keywordsZh
    if (wp['tags_zh'] !== undefined && wp['keywordsZh'] === undefined) {
      newWp.keywordsZh = wp['tags_zh'];
      // 不删除 tags_zh，保持兼容
      changed = true;
      console.log('   ✅ [' + wp.id + '] tags_zh → keywordsZh (kept tags_zh for compatibility)');
    }

    // category_zh → categoryZh (如果存在)
    if (wp['category_zh'] !== undefined && wp['categoryZh'] === undefined) {
      newWp.categoryZh = wp['category_zh'];
      delete newWp['category_zh'];
      changed = true;
      console.log('   ✅ [' + wp.id + '] category_zh → categoryZh');
    }

    if (changed) { migrated++; } else { skipped++; }
    return newWp;
  });

  // 3. 写回文件（格式化，缩进2空格）
  fs.writeFileSync(DATA_FILE, JSON.stringify(migratedData, null, 2), 'utf8');

  console.log('\n✅ Migration complete!');
  console.log('   Migrated: ' + migrated);
  console.log('   Already OK: ' + skipped);
  console.log('\n📝 Next steps:');
  console.log('   1. Review wallpapers.json to confirm fields are correct');
  console.log('   2. node scripts/generate-wallpapers.cjs  (regenerate SEO pages with new fields)');
  console.log('   3. git add wallpapers.json wallpaper/ dist/wallpaper/');
  console.log('   4. git commit -m "refactor: migrate wallpapers.json to camelCase fields"');
  console.log('   5. git push\n');
}

migrate();
