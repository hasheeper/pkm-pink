#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'greeting');
const HTML_PATH = path.join(BASE_DIR, 'greeting.html');
const CSS_PATH = path.join(BASE_DIR, 'greeting.css');
const JS_PATH = path.join(BASE_DIR, 'greeting.js');
const OUTPUT_PATH = path.join(BASE_DIR, 'greeting.bundle.html');

function inlineAsset(html, markerRegex, content, wrapTag) {
  const wrapped = `<${wrapTag}>\n${content}\n</${wrapTag.split(' ')[0]}>`;
  if (!markerRegex.test(html)) {
    throw new Error(`Could not find marker ${markerRegex} in HTML`);
  }
  return html.replace(markerRegex, wrapped);
}

function main() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const js = fs.readFileSync(JS_PATH, 'utf8');

  const inlinedCss = inlineAsset(
    html,
    /<link[^>]+href=["']greeting\.css["'][^>]*>/,
    css,
    'style'
  );

  const inlinedAll = inlineAsset(
    inlinedCss,
    /<script[^>]+src=["']greeting\.js["'][^>]*><\/script>/,
    js,
    'script'
  );

  fs.writeFileSync(OUTPUT_PATH, inlinedAll, 'utf8');
  console.log(`Bundled file written to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
