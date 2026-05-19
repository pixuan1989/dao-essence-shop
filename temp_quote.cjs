// Test new trQuote logic
const QUOTE_MAP = {
  '涅槃重生。':'Out of the ashes, rise again.',
};

function trQuote(q) {
  return QUOTE_MAP[q] || QUOTE_MAP[q.replace(/。$/, '')] || q;
}

const testQuotes = ['涅槃重生', '涅槃重生。', '阳光总在风雨后'];
testQuotes.forEach(q => {
  console.log(`trQuote('${q}') = '${trQuote(q)}'`);
});
