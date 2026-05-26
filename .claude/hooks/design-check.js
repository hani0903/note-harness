#!/usr/bin/env node

// PostToolUse hook: Edit/Write 후 .tsx/.css 파일의 디자인 시스템 위반 감지

const fs = require('fs');

let stdin = '';
process.stdin.on('data', (chunk) => { stdin += chunk; });
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(stdin.replace(/^﻿/, ''));
  } catch {
    process.exit(0);
  }

  const filePath = data?.tool_input?.file_path;
  if (!filePath || !/\.(tsx|css)$/.test(filePath)) process.exit(0);
  if (!fs.existsSync(filePath)) process.exit(0);

  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  // CSS: `border: 1px solid` / TSX inline style: `border: '1px solid'`
  if (/border:\s*['"]?1px\s*solid/.test(content)) {
    violations.push('border: 1px solid — No-Line 규칙 위반 (배경 색 시프트로 대체)');
  }
  // CSS: `box-shadow:` / TSX inline style: `boxShadow:`
  if (/(box-shadow:|boxShadow:)/.test(content)) {
    violations.push('box-shadow/boxShadow — Tonal Layering 사용 권장 (플로팅 요소 Ambient Shadow만 허용)');
  }
  // 하드코딩 검정색 (#000, #000000)
  if (/#000000|#000[^0-9a-fA-F"']/.test(content)) {
    violations.push('#000/#000000 하드코딩 — 디자인 토큰 사용 (예: on_surface #2b3437)');
  }

  if (violations.length > 0) {
    process.stderr.write(
      `\n🎨 Design System Check [${filePath}]\n` +
      violations.map((v) => `  ⚠️  ${v}`).join('\n') +
      '\n'
    );
  }
});
