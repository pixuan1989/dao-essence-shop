/**
 * chp-course-card.js — 章节页侧栏课程卡（动态渲染）
 * 
 * 从 product-zh-map.json 读取商品信息，按当前语言渲染到 #chp-course-card 容器。
 * 只需维护 product-zh-map.json 一处数据，全站（章节页+落地页）同步更新。
 *
 * 商品 ID（硬编码）：prod_644bQm6EUmBGSNkaHZ02IE（盲派命理課程）
 */
(function () {
  var COURSE_ID = 'prod_644bQm6EUmBGSNkaHZ02IE';
  var BUY_URL = '/product-detail?id=' + COURSE_ID;

  /* ── 默认数据（与 creem-sync-v2.js FALLBACK_PRODUCTS + product-zh-map.json 保持一致）── */
  var DEFAULTS = {
    nameEN: 'Xuanzhen Blind-School BaZi Mastery Pack',
    nameCN: '\u6df1\u5165\u5b78\u7fd2\uff1a\u7384\u771f\u76f2\u6d3e\u547d\u7406\u5be6\u6230\u5167\u90e8\u8cc7\u6599',
    descriptionEN: 'Pure Duan Jianye Blind-School system \u2014 from Guest-Host application to core logic, taking you from \'memorizing concepts\' to \'reading real charts\'. Four modules + live case studies. Master BaZi chart analysis upon completion.',
    descriptionCN: '\u7d14\u6b63\u6bb5\u5efa\u696d\u76f2\u6d3e\u9ad4\u7cfb\uff0c\u5f9e\u8cd3\u4e3b\u9ad4\u7528\u5230\u5e95\u5c64\u903f\u8f2f\uff0c\u5e36\u4f60\u5f9e\u300c\u80cc\u6982\u5ff5\u300d\u8d70\u5230\u300c\u771f\u65b7\u4e8b\u300d\u3002\u56db\u5927\u6a21\u584a+\u771f\u5be6\u547d\u4f8b\u5be6\u6230\uff0c\u5b78\u5b8c\u5c31\u80fd\u4e0a\u624b\u5206\u6790\u516b\u5b57\u3002',
    image: '/images/bazi-blind-course.jpg'
  };

  /* ── 尝试从全局 PRODUCT_ZH_MAP（creem-sync-v2.js 已加载时）读取覆盖默认值 ── */
  var zhMap = (typeof PRODUCT_ZH_MAP !== 'undefined') ? PRODUCT_ZH_MAP : null;
  var fallback = (typeof FALLBACK_PRODUCTS !== 'undefined') ? null : null; /* 不依赖 FALLBACK */

  function getData() {
    if (zhMap && zhMap[COURSE_ID]) {
      var m = zhMap[COURSE_ID];
      return {
        nameEN: m.nameEN || DEFAULTS.nameEN,
        nameCN: m.nameCN || DEFAULTS.nameCN,
        descriptionEN: m.descriptionEN || DEFAULTS.descriptionEN,
        descriptionCN: m.descriptionCN || DEFAULTS.descriptionCN,
        image: m.image || DEFAULTS.image
      };
    }
    return DEFAULTS;
  }

  /* ── 判定当前语言 ── */
  function isZh() {
    try { return (typeof DaoI18n !== 'undefined' && DaoI18n.current() === 'zh'); }
    catch(e) { return false; }
  }

  /* ── 渲染卡片 ── */
  function render() {
    var el = document.getElementById('chp-course-card');
    if (!el) return;

    var d = getData();
    var zh = isZh();
    var title = zh ? d.nameCN : d.nameEN;
    var desc = zh ? d.descriptionCN : d.descriptionEN;
    var btnText = zh ? '\u67e5\u770b\u8ab2\u7a0b\u8a73\u60c5 \u2192' : 'View Course &rarr;';

    var html = '<div class="sb-inner">';

    /* 封面图（如果有且文件存在） */
    if (d.image) {
      html += '<div style="margin-bottom:0.8rem;border-radius:8px;overflow:hidden;">' +
              '<img src="' + d.image + '" alt="' + title + '" ' +
              'style="width:100%;height:150px;object-fit:cover;display:block;" loading="lazy" onerror="this.style.display=\'none\'">' +
              '</div>';
    }

    html += '<h3>' + escHtml(title) + '</h3>';
    html += '<p>' + escHtml(desc) + '</p>';
    html += '<a href="' + BUY_URL + '" class="btn-gold">' + btnText + '</a>';
    html += '</div>';

    el.innerHTML = html;
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── 启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  /* i18n 语言切换时重新渲染 */
  document.addEventListener('daoessence:i18n-changed', render);

  /* 暴露给外部手动刷新 */
  window.renderChpCourseCard = render;
})();
