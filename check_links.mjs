const urls = [
  'https://www.daoessentia.com/zh/bazi/',
  'https://www.daoessentia.com/bazi-form',
  'https://www.daoessentia.com/zh/blog/bazi-10-day-masters-guide',
  'https://www.daoessentia.com/zh/#free-bazi',
  'https://www.daoessentia.com/#free-bazi',
  'https://www.daoessentia.com/zh/favorable-element',
  'https://www.daoessentia.com/favorable-element',
  'https://www.daoessentia.com/zh/bazi-form',
  'https://www.daoessentia.com/bazi-form',
  'https://www.daoessentia.com/tools/bazi',
  'https://www.daoessentia.com/zh/blog/',
  'https://www.daoessentia.com/zh/blog/feng-shui-4-items-dont-replace',
];

for (const url of urls) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    console.log(res.status, url);
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
