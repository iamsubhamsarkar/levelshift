#!/usr/bin/env node
/**
 * LevelShift — Content Builder
 * 
 * Reads markdown unit files from /content/ and converts them to
 * JSON card files in /src/lib/data/cards/.
 * 
 * Usage: node build-content.js
 * 
 * Markdown Format:
 * ---
 * unit: p1u1
 * title: Variables, Types & Strings
 * teaches: [basics.types, basics.strings]
 * requires: []
 * ---
 * 
 * ## HOOK
 * question: What's the output?
 * ```java
 * System.out.println(1 + "2" + 3);
 * ```
 * 
 * ## FAIL_FIRST
 * prompt: Make this print "Hello World"
 * ```java
 * // starter code
 * ```
 * hint: Think about System.out.println
 * expected: Hello World
 * 
 * ## ANALOGY
 * A variable is a labeled box. You put something in it.
 * 
 * ## CODE
 * ```java
 * String name = "LevelShift";
 * int version = 1;
 * ```
 * highlight: [1]
 * annotation: Strings use double quotes. ints don't.
 * 
 * ## BREAK_IT
 * setup:
 * ```java
 * int x = 5;
 * ```
 * modification: What if: int x = 5.0;
 * question: What happens?
 * options: [Works fine, Compile error, Prints 5.0]
 * correct: 1
 * explanation: Can't assign double to int without casting.
 * 
 * ## CONTRAST
 * label: Which is which?
 * codeA:
 * ```java
 * int x = 5;
 * ```
 * codeB:
 * ```java
 * Integer x = 5;
 * ```
 * question: Which is a primitive?
 * options: [A is primitive, B is primitive, Both, Neither]
 * correct: 0
 * explanation: int is primitive, Integer is an object wrapper.
 * 
 * ## EXPLAIN_BACK
 * prompt: What's the difference between int and Integer?
 * model: int is a primitive (stored on stack, no methods). Integer is a wrapper object (stored on heap, has methods like .toString()). Java auto-boxes between them.
 * 
 * ## CONNECT
 * text: In REST Assured, you'll use Integer for JSON numbers.
 * ```java
 * body("age", equalTo(25)); // Integer comparison
 * ```
 * note: Primitives can't be null. Wrappers can. This matters for API responses.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_DIR = join(__dirname, 'content');
const OUTPUT_DIR = join(__dirname, 'src', 'lib', 'data', 'cards');

// ─── Parser ────────────────────────────────────────────────────────────────────

function parseUnitFile(content, filename) {
  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.error(`  ❌ No frontmatter in ${filename}`);
    return null;
  }

  const frontmatter = parseFrontmatter(fmMatch[1]);
  const body = fmMatch[2].trim();

  // Split into card sections by ## CARD_TYPE
  const sections = body.split(/^## /gm).filter(s => s.trim());

  const cards = sections.map((section, index) => {
    const lines = section.trim().split('\n');
    const typeLine = lines[0].trim().toUpperCase();
    const type = typeLine.toLowerCase().replace(/\s+/g, '_');
    const cardBody = lines.slice(1).join('\n').trim();

    const cardId = `${frontmatter.unit}_c${index + 1}`;

    switch (type) {
      case 'hook': return parseHookCard(cardId, cardBody);
      case 'fail_first': return parseFailFirstCard(cardId, cardBody);
      case 'analogy': return parseAnalogyCard(cardId, cardBody);
      case 'code': return parseCodeCard(cardId, cardBody);
      case 'break_it': return parseBreakItCard(cardId, cardBody);
      case 'contrast': return parseContrastCard(cardId, cardBody);
      case 'explain_back': return parseExplainBackCard(cardId, cardBody);
      case 'connect': return parseConnectCard(cardId, cardBody);
      default:
        console.warn(`  ⚠️  Unknown card type: ${type}`);
        return { id: cardId, type: 'unknown', content: { text: cardBody } };
    }
  });

  return {
    unitId: frontmatter.unit,
    title: frontmatter.title,
    phase: parseInt(frontmatter.unit?.charAt(1)) || 1,
    unit: parseInt(frontmatter.unit?.slice(3)) || 1,
    teaches: frontmatter.teaches || [],
    requires: frontmatter.requires || [],
    estimatedMinutes: Math.max(15, cards.length * 3),
    cards
  };
}

// ─── Card Parsers ──────────────────────────────────────────────────────────────

function parseHookCard(id, body) {
  const question = extractField(body, 'question') || body.split('\n')[0];
  const code = extractCodeBlock(body);
  return { id, type: 'hook', content: { question, code } };
}

function parseFailFirstCard(id, body) {
  // Extract all code blocks - first is starter, second (if exists) is solution
  const codeBlocks = extractAllCodeBlocks(body);
  const starterCode = codeBlocks[0] || '';
  const solutionCode = codeBlocks[1] || extractField(body, 'solution') || '';
  
  return {
    id, type: 'fail_first',
    content: {
      prompt: extractField(body, 'prompt') || body.split('\n')[0],
      starterCode,
      hint: extractField(body, 'hint'),
      expectedOutput: extractField(body, 'expected'),
      solutionCode: solutionCode || null
    }
  };
}

function parseAnalogyCard(id, body) {
  const text = body.replace(/visual:.*$/gm, '').trim();
  const visual = extractField(body, 'visual');
  return { id, type: 'analogy', content: { text, visual } };
}

function parseCodeCard(id, body) {
  const code = extractCodeBlock(body) || '';
  const highlight = extractArrayField(body, 'highlight');
  const annotation = extractField(body, 'annotation');
  return { id, type: 'code', content: { code, highlight, annotation } };
}

function parseBreakItCard(id, body) {
  return {
    id, type: 'break_it',
    content: {
      setup: extractCodeBlock(body, 0),
      modification: extractField(body, 'modification'),
      question: extractField(body, 'question'),
      options: extractArrayField(body, 'options'),
      correct: parseInt(extractField(body, 'correct')) || 0,
      explanation: extractField(body, 'explanation')
    }
  };
}

function parseContrastCard(id, body) {
  const codeBlocks = extractAllCodeBlocks(body);
  return {
    id, type: 'contrast',
    content: {
      label: extractField(body, 'label'),
      codeA: codeBlocks[0] || '',
      codeB: codeBlocks[1] || '',
      question: extractField(body, 'question'),
      options: extractArrayField(body, 'options'),
      correct: parseInt(extractField(body, 'correct')) || 0,
      explanation: extractField(body, 'explanation')
    }
  };
}

function parseExplainBackCard(id, body) {
  const mode = extractField(body, 'mode');
  
  if (mode === 'fill_blank') {
    return {
      id, type: 'explain_back',
      content: {
        mode: 'fill_blank',
        prompt: extractField(body, 'prompt'),
        sentence: extractField(body, 'sentence'),
        blanks: extractArrayField(body, 'blanks'),
        distractors: extractArrayField(body, 'distractors')
      }
    };
  }
  
  if (mode === 'pick_best') {
    return {
      id, type: 'explain_back',
      content: {
        mode: 'pick_best',
        prompt: extractField(body, 'prompt'),
        options: extractArrayField(body, 'options'),
        correct: parseInt(extractField(body, 'correct') || '0', 10)
      }
    };
  }

  // Legacy mode (plain text prompt + model answer)
  return {
    id, type: 'explain_back',
    content: {
      prompt: extractField(body, 'prompt') || body.split('\n')[0],
      modelAnswer: extractField(body, 'model') || extractField(body, 'modelAnswer') || ''
    }
  };
}

function parseConnectCard(id, body) {
  return {
    id, type: 'connect',
    content: {
      text: extractField(body, 'text') || body.split('```')[0].trim(),
      code: extractCodeBlock(body),
      note: extractField(body, 'note')
    }
  };
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function parseFrontmatter(fm) {
  const result = {};
  for (const line of fm.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (value.startsWith('[') && value.endsWith(']')) {
        result[key] = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      } else {
        result[key] = value.trim();
      }
    }
  }
  return result;
}

function extractField(body, fieldName) {
  const regex = new RegExp(`^${fieldName}:\\s*(.+)$`, 'mi');
  const match = body.match(regex);
  return match ? match[1].trim() : null;
}

function extractArrayField(body, fieldName) {
  const raw = extractField(body, fieldName);
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
  }
  return [raw];
}

function extractCodeBlock(body, index = 0) {
  const matches = [...body.matchAll(/```\w*\n([\s\S]*?)```/g)];
  return matches[index] ? matches[index][1].trim() : null;
}

function extractAllCodeBlocks(body) {
  const matches = [...body.matchAll(/```\w*\n([\s\S]*?)```/g)];
  return matches.map(m => m[1].trim());
}

// ─── Main Build ────────────────────────────────────────────────────────────────

function build() {
  console.log('\n📚 LevelShift Content Builder\n');

  if (!existsSync(CONTENT_DIR)) {
    console.error('❌ Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }

  // Find all phase directories
  const phaseDirs = readdirSync(CONTENT_DIR).filter(d =>
    existsSync(join(CONTENT_DIR, d)) && d.startsWith('phase')
  );

  let totalUnits = 0;
  let totalCards = 0;

  for (const phaseDir of phaseDirs.sort()) {
    const phaseNum = phaseDir.match(/phase(\d+)/)?.[1] || '0';
    const outputPhaseDir = join(OUTPUT_DIR, `phase${phaseNum}`);

    if (!existsSync(outputPhaseDir)) {
      mkdirSync(outputPhaseDir, { recursive: true });
    }

    const files = readdirSync(join(CONTENT_DIR, phaseDir))
      .filter(f => f.endsWith('.md'))
      .sort();

    console.log(`  Phase ${phaseNum}: ${files.length} unit(s)`);

    for (const file of files) {
      const content = readFileSync(join(CONTENT_DIR, phaseDir, file), 'utf-8');
      const parsed = parseUnitFile(content, file);

      if (!parsed) continue;

      const outputFile = join(outputPhaseDir, `${parsed.unitId}.json`);
      writeFileSync(outputFile, JSON.stringify(parsed, null, 2));

      console.log(`    ✅ ${parsed.title} (${parsed.cards.length} cards)`);
      totalUnits++;
      totalCards += parsed.cards.length;
    }
  }

  console.log(`\n  📊 Built: ${totalUnits} units, ${totalCards} cards total`);
  console.log(`  📁 Output: ${OUTPUT_DIR}\n`);
}

build();
