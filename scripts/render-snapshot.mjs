#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('usage: render-snapshot.mjs <built page html> <output html>');
const inputPath = resolve(input);
const outputPath = resolve(output);
let html = readFileSync(inputPath, 'utf8');
const stylesheet = html.match(/<link href="([^"]+\.css)" rel="stylesheet">/);
if (!stylesheet) throw new Error('built page has no stylesheet link');
const cssPath = resolve(dirname(inputPath), stylesheet[1]);
const css = readFileSync(cssPath, 'utf8');
html = html.replace(stylesheet[0], `<style>\n${css}\n</style>`);
html = html.replace(/<link href="[^"]+" rel="modulepreload">/g, '');
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
