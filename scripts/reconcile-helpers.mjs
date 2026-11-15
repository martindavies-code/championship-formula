import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const PINNED_ELVIDGE_SHA = 'fb4c796d5faffd7098d481bfc041778b80a2286c';

export const TEAM_ALIASES = {
  "nott'm forest": 'nottingham forest',
  'nottm forest': 'nottingham forest',
  "queens park r": 'queens park rangers',
  "queen's park r": 'queens park rangers',
  "queen's park rangers": 'queens park rangers',
  qpr: 'queens park rangers',
  'man united': 'manchester united',
  'man utd': 'manchester united',
  'man city': 'manchester city',
  wolves: 'wolverhampton wanderers',
  wolverhampton: 'wolverhampton wanderers',
  bournemouth: 'afc bournemouth',
  'a. f. c. bournemouth': 'afc bournemouth',
  brighton: 'brighton & hove albion',
  'brighton & hove a': 'brighton & hove albion',
  'brighton and hove albion': 'brighton & hove albion',
  westbromwich: 'west bromwich albion',
  'west brom': 'west bromwich albion',
  tottenham: 'tottenham hotspur',
  'tottenham hotspurs': 'tottenham hotspur',
  'west ham': 'west ham united',
  newcastle: 'newcastle united',
  'sheff united': 'sheffield united',
  'sheffield utd': 'sheffield united',
  'sheff wed': 'sheffield wednesday',
  'sheff weds': 'sheffield wednesday',
  'sheffield weds': 'sheffield wednesday',
  'sheff wednesday': 'sheffield wednesday',
  'sheffield wedsnesday': 'sheffield wednesday',
  huddersfield: 'huddersfield town',
  blackburn: 'blackburn rovers',
  bolton: 'bolton wanderers',
  bradford: 'bradford city',
  charlton: 'charlton athletic',
  'charlton atletic': 'charlton athletic',
  cardiff: 'cardiff city',
  coventry: 'coventry city',
  derby: 'derby county',
  ipswich: 'ipswich town',
  leeds: 'leeds united',
  leicester: 'leicester city',
  norwich: 'norwich city',
  stoke: 'stoke city',
  swansea: 'swansea city',
  wigan: 'wigan athletic',
  'wigan athleitc': 'wigan athletic',
  birmingham: 'birmingham city',
  middlesboro: 'middlesbrough',
  hull: 'hull city',
  luton: 'luton town',
  plymouth: 'plymouth argyle',
  preston: 'preston north end',
  rotherham: 'rotherham united',
  'bristol rvs': 'bristol rovers',
  'bristol c': 'bristol city',
  burton: 'burton albion',
  cambridge: 'cambridge united',
  carlisle: 'carlisle united',
  'carlise united': 'carlisle united',
  cheltenham: 'cheltenham town',
  'chester': 'chester',
  colchester: 'colchester united',
  crawley: 'crawley town',
  crewe: 'crewe alexandra',
  'crystal palalce': 'crystal palace',
  'crystal p': 'crystal palace',
  doncaster: 'doncaster rovers',
  exeter: 'exeter city',
  'exerter city': 'exeter city',
  fleetwood: 'fleetwood town',
  'forest green': 'forest green rovers',
  grimsby: 'grimsby town',
  hartlepool: 'hartlepool united',
  hereford: 'hereford united',
  lincoln: 'lincoln city',
  macclesfield: 'macclesfield town',
  mansfield: 'mansfield town',
  'milton keynes': 'milton keynes dons',
  'mk dons': 'milton keynes dons',
  northampton: 'northampton town',
  'notts co': 'notts county',
  'notts c': 'notts county',
  nottingham: 'nottingham forest',
  oldham: 'oldham athletic',
  oxford: 'oxford united',
  peterborough: 'peterborough united',
  peterboro: 'peterborough united',
  salford: 'salford city',
  scunthorpe: 'scunthorpe united',
  'scunthorpe town': 'scunthorpe united',
  shrewsbury: 'shrewsbury town',
  southend: 'southend united',
  stockport: 'stockport county',
  swindon: 'swindon town',
  torquay: 'torquay united',
  tranmere: 'tranmere rovers',
  wycombe: 'wycombe wanderers',
  york: 'york city',
  accrington: 'accrington stanley',
  'dag and red': 'dagenham & redbridge',
  'dag & red': 'dagenham & redbridge',
  'dagenham and redbridge': 'dagenham & redbridge',
  boston: 'boston united',
  halifax: 'halifax town',
  harrogate: 'harrogate town',
  kidderminster: 'kidderminster harriers',
  rushden: 'rushden & diamonds',
  'rushden & d': 'rushden & diamonds',
  yeovil: 'yeovil town',
  maidstone: 'maidstone united',
  sutton: 'sutton united',
};

export function normalizeClubKey(name, startYear) {
  let s = String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&');
  if (TEAM_ALIASES[s]) s = TEAM_ALIASES[s];
  if (s === 'aldershot' && startYear >= 2008) s = 'aldershot town';
  if (s === 'wimbledon' && startYear >= 2008) s = 'afc wimbledon';
  if (s === 'chester city') s = 'chester';
  return s;
}

export function slugifyClubId(key, startYear) {
  // Keep distinct pre-1992 Aldershot vs post-2008 Aldershot Town; pre-1988 vs reformed Newport County annotated in manifest
  if (key === 'chester') return 'chester';
  return key.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function displayClubName(elvidgeName, startYear) {
  if (elvidgeName === 'Dagenham and Redbridge') return 'Dagenham & Redbridge';
  if (elvidgeName === 'Chester') return startYear <= 1981 ? 'Chester' : 'Chester City';
  return elvidgeName;
}

export function formatSeasonLabel(startYear) {
  const endTwo = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endTwo}`;
}

export function historicalDivisionName(tier, startYear) {
  if (startYear <= 1991) {
    return [
      'Football League First Division',
      'Football League Second Division',
      'Football League Third Division',
      'Football League Fourth Division',
    ][tier - 1];
  }
  if (startYear <= 2003) {
    return [
      'Premier League',
      'Football League First Division',
      'Football League Second Division',
      'Football League Third Division',
    ][tier - 1];
  }
  if (startYear <= 2015) {
    return [
      'Premier League',
      'Football League Championship',
      'Football League One',
      'Football League Two',
    ][tier - 1];
  }
  return [
    'Premier League',
    'EFL Championship',
    'EFL League One',
    'EFL League Two',
  ][tier - 1];
}

export function presentDayTierLabel(tier) {
  return [
    'Premier League',
    'EFL Championship',
    'EFL League One',
    'EFL League Two',
  ][tier - 1];
}

export function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === ',' && !q) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  let hi = 0;
  while (hi < lines.length && !lines[hi].trim()) hi++;
  const headers = parseLine(lines[hi]).map((h) => h.trim());
  const rows = [];
  for (let i = hi + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (vals[j] ?? '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

export function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function sha256String(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

export function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}

export function parseRsssfFlaSeason(html, sy) {
  const lines = stripHtml(html).split(/\r?\n/);
  const tables = [];
  let cur = null;
  let ptsIdx = 11;
  for (const line of lines) {
    if (/\bP\s+W\s+D\s+L\s+F\s+A\s+W\s+D\s+L\s+F\s+A\s+/.test(line)) {
      if (/\bGD\s+PD\s+PTS|\bGS\s+PD\s+PTS/i.test(line)) ptsIdx = 13;
      else if (/\b(?:Dif|Df)\s+Pts/i.test(line)) ptsIdx = 12;
      else ptsIdx = 11;
      cur = [];
      tables.push(cur);
      continue;
    }
    if (cur) {
      if (!line.trim()) {
        if (cur.length >= 18) cur = null;
        continue;
      }
      const m = /^\s*(\d{1,2})\.?\s+(.+?)\s{1,}(\d+(?:\s+-?\d+\+?){11,15})(?:\s+.*)?$/.exec(line);
      if (m) {
        const [, pos, rawName, numStr] = m;
        const cleanName = rawName.replace(/^[+*]\s*/, '').replace(/\s*\*$/, '').trim();
        const nums = numStr.trim().split(/\s+/).map((x) => Number(x.replace(/\+$/, '')));
        const [p, hw, hd, hl, hf, ha, aw, ad, al, af, aa] = nums;
        const pts = nums[ptsIdx];
        const w = hw + aw;
        const d = hd + ad;
        const l = hl + al;
        const gf = hf + af;
        const ga = ha + aa;
        const letters = cleanName.replace(/[^A-Za-z]/g, '');
        const upper = letters.length > 0 && letters === letters.toUpperCase();
        cur.push({
          pos: Number(pos),
          rawName: cleanName,
          normKey: normalizeClubKey(cleanName, sy),
          p, w, d, l, gf, ga, pts,
          adj: pts - (3 * w + d),
          upper,
        });
      }
    }
  }

  // Parse Play-off Final winners when present (1986-87..2007-08)
  const playoffFinals = [];
  const rawLines = stripHtml(html).split(/\r?\n/);
  let nextImplicitTier = 2;
  for (let i = 0; i < rawLines.length; i++) {
    const hm = /^\s*(?:Division\s+([1234])\s+)?Play-?offs?(?:\s+-|\b)/i.exec(rawLines[i]);
    if (hm) {
      let tier;
      if (hm[1]) {
        const divNum = Number(hm[1]);
        // Football League Division 1/2/3/4 vs Premier League: pre-1992 Div 2/3/4 are Tiers 2/3/4; 1992-2007 Div 1/2/3 are Tiers 2/3/4!
        tier = sy <= 1991 ? divNum : divNum + 1;
        nextImplicitTier = tier + 1;
      } else {
        tier = nextImplicitTier++;
      }
      const chunk = rawLines.slice(i, Math.min(rawLines.length, i + 95)).join('\n');
      const finalIdx = chunk.search(/\bFinal\b/i);
      const afterFinal = finalIdx >= 0 ? chunk.slice(finalIdx) : chunk;
      playoffFinals.push({ tier, text: afterFinal });
    }
  }

  return { tables: tables.slice(0, 4), playoffFinals };
}

export function parseRsssfTableseSeason(html, sy) {
  const lines = html.split(/\r?\n/);
  const findStart = (reA, reH) => {
    const ia = lines.findIndex((l) => reA.test(l));
    return ia !== -1 ? ia : lines.findIndex((l, idx) => idx > 5 && reH.test(stripHtml(l).trim()));
  };
  const idxMap = [
    findStart(/name="premier"/i, /^(Premier League|Premiership)$/i),
    findStart(/name="champ"/i, /^(Championship|League Championship)$/i),
    findStart(/name="first"/i, /^(Division 1|League Division One|League One|Third Level)/i),
    findStart(/name="second"/i, /^(Division 2|League Division Two|League Two|Fourth Level)/i),
  ];

  const tables = idxMap.map((startIdx, ti) => {
    const endIdx = ti < 3 && idxMap[ti + 1] > startIdx ? idxMap[ti + 1] : lines.length;
    const rows = [];
    let collectingTable = false;
    let tableDone = false;
    let playoffText = '';
    let inPlayoff = false;
    for (let i = startIdx; i < endIdx; i++) {
      const clean = stripHtml(lines[i]);
      const trimmed = clean.trim();
      if (/Final Table:/i.test(clean) && !tableDone) {
        collectingTable = true;
        continue;
      }
      if (/^Promotion Playoffs?\b/i.test(trimmed) && rows.length >= 18) {
        inPlayoff = true;
        collectingTable = false;
        tableDone = true;
      }
      if (inPlayoff) {
        if (/^(?:Relegation|National League|Blue Square|Conference)\b/i.test(trimmed)) break;
        playoffText += clean + '\n';
        continue;
      }
      if (collectingTable) {
        if (/^Round 1|^Match Details|^Promotion Playoffs?\b/i.test(trimmed) && rows.length >= 18) {
          collectingTable = false;
          tableDone = true;
          if (/^Promotion Playoffs?\b/i.test(trimmed)) inPlayoff = true;
          continue;
        }
        const m = /^\s*(\d+)\.\s*(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*-\s*(\d+)\s+(\d+)(.*)$/.exec(clean);
        if (m && rows.length < 24) {
          const [, pos, name, p, w, d, l, gf, ga, pts, rest] = m;
          rows.push({
            pos: Number(pos),
            rawName: name.trim(),
            normKey: normalizeClubKey(name, sy),
            p: Number(p), w: Number(w), d: Number(d), l: Number(l),
            gf: Number(gf), ga: Number(ga), pts: Number(pts),
            adj: Number(pts) - (3 * Number(w) + Number(d)),
            rest: rest.trim(),
            relegatedMarker: /\bRelegated\b/i.test(rest),
            promotedMarker: /\bPromoted\b/i.test(rest),
            playoffMarker: /\bPlayoff\b/i.test(rest),
            championMarker: /\bChampions\b/i.test(rest),
          });
        } else if (!trimmed && rows.length >= 20) {
          collectingTable = false;
          tableDone = true;
        }
      }
    }
    return { rows, playoffText };
  });

  return {
    tables: tables.map((t) => t.rows),
    playoffTexts: tables.map((t, idx) => ({ tier: idx + 1, text: t.playoffText })),
  };
}

export function extractWinnerFromPlayoffText(text, candidateTeams, startYear) {
  if (!text) return null;
  const finalIdx = text.search(/\bFinal\b/i);
  const section = finalIdx >= 0 ? text.slice(finalIdx) : text;
  const cleanLines = section.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let lastMatchWinner = null;
  for (const rawLine of cleanLines) {
    const line = rawLine.replace(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Za-z]+\s+/i, '');
    // 1. "<Team1>.. <G1> <Team2>.. <G2>" or "<Team1> <G1>-<G2> <Team2>"
    let m = /^([A-Za-z0-9 &'.-]+?)\s*\.{2,}\s*(\d+)\s+([A-Za-z0-9 &'.-]+?)\s*\.{2,}\s*(\d+)(?:\s|$)/.exec(line);
    if (!m) {
      m = /^([A-Za-z0-9 &'.-]+?)\s+(\d+)\s*-\s*(\d+)\s+([A-Za-z0-9 &'.-]+?)(?:\s+\[|$)/.exec(line);
      if (m) m = [m[0], m[1], m[2], m[4], m[3]];
    }
    if (!m) continue;
    const [, t1, s1, t2, s2] = m;
    const g1 = Number(s1), g2 = Number(s2);
    const n1 = normalizeClubKey(t1, startYear);
    const n2 = normalizeClubKey(t2, startYear);
    const matchCand = (nk) => candidateTeams.find((c) => c === nk || c.startsWith(nk) || c.endsWith(` ${nk}`) || nk.startsWith(c.split(' ')[0]));
    const c1 = matchCand(n1);
    const c2 = matchCand(n2);
    if (!c1 && !c2) continue;
    let lineWinner = null;
    if (g1 > g2) lineWinner = c1 ?? n1;
    else if (g2 > g1) lineWinner = c2 ?? n2;
    else {
      // Bracketed penalty score on same line, e.g. "[aet, 6-5 pen]" or "[4-5 pen]"
      const samePen = /\[(?:[^[\]]*,\s*)?(\d+)\s*-\s*(\d+)\s*pen\]/i.exec(rawLine);
      if (samePen) {
        const p1 = Number(samePen[1]), p2 = Number(samePen[2]);
        if (p1 > p2) lineWinner = c1 ?? n1;
        else if (p2 > p1) lineWinner = c2 ?? n2;
      } else {
        const idx = section.indexOf(rawLine);
        const snippet = section.slice(idx >= 0 ? idx : 0, (idx >= 0 ? idx : 0) + 200);
        const wn = /([A-Za-z' .-]+?)\s+won\s+(?:on\s+penalties|\d+-\d+\s+on\s+pen|\d+-\d+)/i.exec(snippet);
        if (wn) lineWinner = matchCand(normalizeClubKey(wn[1], startYear)) ?? normalizeClubKey(wn[1], startYear);
      }
    }
    if (lineWinner) {
      if (finalIdx >= 0) return lineWinner;
      lastMatchWinner = lineWinner;
    }
  }
  return lastMatchWinner;
}

export function sortStandings(rows, tieBreakRules, isCurtailed) {
  if (isCurtailed) {
    return [...rows].sort((a, b) => {
      const ppgDiff = (b.points / b.played) - (a.points / a.played);
      if (Math.abs(ppgDiff) > 1e-12) return ppgDiff;
      const gdPgDiff = (b.gd / b.played) - (a.gd / a.played);
      if (Math.abs(gdPgDiff) > 1e-12) return gdPgDiff;
      const gfPgDiff = (b.gf / b.played) - (a.gf / a.played);
      if (Math.abs(gfPgDiff) > 1e-12) return gfPgDiff;
      return a.team.localeCompare(b.team);
    });
  }
  const gfFirst = tieBreakRules?.[1] === 'gf';
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (gfFirst) {
      if (b.gf !== a.gf) return b.gf - a.gf;
      if (b.gd !== a.gd) return b.gd - a.gd;
    } else {
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
    }
    return a.team.localeCompare(b.team);
  });
}
