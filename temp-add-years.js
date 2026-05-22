import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ZODIAC = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];

const ZH_YEARS = {
  rat:'2020、2008、1996、1984、1972、1960、1948、1936、1924',
  ox:'2021、2009、1997、1985、1973、1961、1949、1937、1925',
  tiger:'2022、2010、1998、1986、1974、1962、1950、1938、1926',
  rabbit:'2023、2011、1999、1987、1975、1963、1951、1939、1927',
  dragon:'2024、2012、2000、1988、1976、1964、1952、1940、1928',
  snake:'2025、2013、2001、1989、1977、1965、1953、1941、1929',
  horse:'2026、2014、2002、1990、1978、1966、1954、1942、1930',
  goat:'2027、2015、2003、1991、1979、1967、1955、1943、1931',
  monkey:'2028、2016、2004、1992、1980、1968、1956、1944、1932',
  rooster:'2029、2017、2005、1993、1981、1969、1957、1945、1933',
  dog:'2030、2018、2006、1994、1982、1970、1958、1946、1934',
  pig:'2031、2019、2007、1995、1983、1971、1959、1947、1935'
};

const EN_YEARS = {
  rat:'2020, 2008, 1996, 1984, 1972, 1960, 1948, 1936, 1924',
  ox:'2021, 2009, 1997, 1985, 1973, 1961, 1949, 1937, 1925',
  tiger:'2022, 2010, 1998, 1986, 1974, 1962, 1950, 1938, 1926',
  rabbit:'2023, 2011, 1999, 1987, 1975, 1963, 1951, 1939, 1927',
  dragon:'2024, 2012, 2000, 1988, 1976, 1964, 1952, 1940, 1928',
  snake:'2025, 2013, 2001, 1989, 1977, 1965, 1953, 1941, 1929',
  horse:'2026, 2014, 2002, 1990, 1978, 1966, 1954, 1942, 1930',
  goat:'2027, 2015, 2003, 1991, 1979, 1967, 1955, 1943, 1931',
  monkey:'2028, 2016, 2004, 1992, 1980, 1968, 1956, 1944, 1932',
  rooster:'2029, 2017, 2005, 1993, 1981, 1969, 1957, 1945, 1933',
  dog:'2030, 2018, 2006, 1994, 1982, 1970, 1958, 1946, 1934',
  pig:'2031, 2019, 2007, 1995, 1983, 1971, 1959, 1947, 1935'
};

const ZH_NAMES = { rat:'鼠', ox:'牛', tiger:'虎', rabbit:'兔', dragon:'龙', snake:'蛇', horse:'马', goat:'羊', monkey:'猴', rooster:'鸡', dog:'狗', pig:'猪' };
const EN_NAMES = { rat:'Rat', ox:'Ox', tiger:'Tiger', rabbit:'Rabbit', dragon:'Dragon', snake:'Snake', horse:'Horse', goat:'Goat', monkey:'Monkey', rooster:'Rooster', dog:'Dog', pig:'Pig' };

ZODIAC.forEach(key => {
  // Chinese version
  const zhPath = path.join(__dirname, 'zodiac', key + '.html');
  let zhContent = fs.readFileSync(zhPath, 'utf8');
  const zhInsert = `<h3>出生年份</h3>\n<p>如果你出生于以下年份，你的生肖是<strong>${ZH_NAMES[key]}</strong>：${ZH_YEARS[key]}。</p>\n`;
  zhContent = zhContent.replace('<h3>属' + ZH_NAMES[key] + '人的性格特点</h3>', zhInsert + '<h3>属' + ZH_NAMES[key] + '人的性格特点</h3>');
  fs.writeFileSync(zhPath, zhContent, 'utf8');
  console.log('Updated ' + zhPath);

  // English version
  const enPath = path.join(__dirname, 'zodiac', key + '-en.html');
  let enContent = fs.readFileSync(enPath, 'utf8');
  const enInsert = `<h3>Birth Years</h3>\n<p>If you were born in any of these years, your Chinese zodiac sign is <strong>${EN_NAMES[key]}</strong>: ${EN_YEARS[key]}.</p>\n`;
  enContent = enContent.replace('<h3>' + EN_NAMES[key] + ' Personality Traits</h3>', enInsert + '<h3>' + EN_NAMES[key] + ' Personality Traits</h3>');
  fs.writeFileSync(enPath, enContent, 'utf8');
  console.log('Updated ' + enPath);
});

console.log('Done!');
