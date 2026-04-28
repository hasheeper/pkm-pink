import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dashboardAppDir = path.join(repoRoot, 'ST', 'Dashboard', 'app');
const templatePath = path.join(repoRoot, 'ST', 'host', 'dashboard', 'dashboard-inject.template.js');
const miniLogoCssPath = path.join(repoRoot, 'assets', 'logo', 'acezero-logo-mini.css');
const miniLogoJsPath = path.join(repoRoot, 'assets', 'logo', 'acezero-logo-mini.js');
const outputPath = path.join(repoRoot, 'ST', 'host', 'dashboard', 'dashboard-inject.js');
const dashboardEmbedsDir = path.join(repoRoot, 'ST', 'Dashboard', 'embeds');

async function read(file) {
  return fs.readFile(file, 'utf8');
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (_) {
    return false;
  }
}

function inlineDashboardHtml(indexHtml, assets) {
  let html = indexHtml;
  const hostBootstrap = `<script>\nObject.defineProperty(window, 'ACE0_OVERVIEW_BOOT_MODE', {\n  value: 'host',\n  writable: false,\n  configurable: true\n});\n<\/script>`;

  html = html.replace(
    /<script>\s*window\.ACE0_OVERVIEW_BOOT_MODE\s*=\s*'[^']+'\s*;\s*<\/script>/i,
    ''
  );

  html = html.replace(
    /<link rel="stylesheet" href="\.\/shared\/theme\.css">/i,
    `<style id="dashboard-theme-stylesheet">\n${assets.themeCss}\n<\/style>`
  );

  // Inline overview style (Page 1 styles)
  html = html.replace(
    /<link rel="stylesheet" href="\.\/pages\/dossier\/style\.css">/i,
    `<style id="dossier-page-stylesheet">\n${assets.dossierCss}\n<\/style>`
  );

  html = html.replace(
    /<link rel="stylesheet" href="\.\/pages\/expansion\/style\.css">/i,
    `<style id="expansion-page-stylesheet">\n${assets.expansionCss}\n<\/style>`
  );

  html = html.replace(
    /<link rel="stylesheet" href="\.\/pages\/overview\/style\.css"[^>]*>/i,
    `<style id="home-page-stylesheet">\n${assets.homeCss}\n<\/style>`
  );

  const debugBootstrap = `<script>
(function () {
  const emit = (stage, extra = {}) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'ACE0_DASHBOARD_DEBUG', stage, extra }, '*');
      }
    } catch (_) {}
    try {
      console.log('[ACE0 Dashboard iframe]', stage, extra);
    } catch (_) {}
  };

  window.addEventListener('error', (event) => {
    emit('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error && event.error.stack ? String(event.error.stack) : ''
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    emit('unhandledrejection', {
      reason: typeof reason === 'string' ? reason : String(reason),
      stack: reason && reason.stack ? String(reason.stack) : ''
    });
  });

  document.addEventListener('DOMContentLoaded', () => emit('domcontentloaded'));
  window.addEventListener('load', () => {
    emit('load');
    setTimeout(() => {
      emit('postload', {
        title: document.title,
        overviewLength: document.getElementById('kazu-terminal-panel')?.innerHTML?.length || 0,
        ledgerLength: document.getElementById('kazu-ledger-panel')?.innerHTML?.length || 0,
        rosterLength: document.getElementById('roster-track')?.innerHTML?.length || 0
      });
    }, 300);
  });

  emit('bootstrap');
})();
<\/script>`;

  html = html.replace(/<link rel="stylesheet" href="\.\/shell\/shell\.css">/i, `<style>\n${assets.css}\n<\/style>`);

  html = html.replace(
    /<script src="(?:\.\/shared\/svg-library\.js|https:\/\/files\.catbox\.moe\/fanyh2\.js)"><\/script>\s*<script src="\.\/shared\/characters\.js"><\/script>\s*<script src="\.\/shared\/utils\.js"><\/script>\s*<script src="\.\/shell\/bridge\.js"><\/script>\s*<script src="\.\/pages\/dossier\/index\.js"><\/script>\s*<script src="\.\/pages\/expansion\/index\.js"><\/script>\s*<script src="\.\/shell\/shell\.js"><\/script>(?:\s*<script src="\.\.\/\.\.\/(?:act|new)\/acezero-act-plugin\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/config\.debug\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/config\.tavern\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/campaign-runtime\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/planner-runtime\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/execution-runtime\.js"><\/script>)?(?:\s*<script src="\.\/pages\/overview\/index\.js"><\/script>)?/i,
    `${debugBootstrap}\n${hostBootstrap}\n<script>\n${assets.svgLibraryJs}\n</script>\n<script>\n${assets.charactersJs}\n</script>\n<script>\n${assets.utilsJs}\n</script>\n<script>\n${assets.bridgeJs}\n</script>\n<script>\nwindow.ACE0_EMBEDDED_PAGES = ${assets.embeddedPagesJson};\n</script>\n<script>\n${assets.dossierJs}\n</script>\n<script>\n${assets.expansionJs}\n</script>\n<script>\n${assets.scriptJs}\n</script>\n<script>\n${assets.overviewTavernConfigJs}\n</script>\n<script>\n${assets.overviewCampaignRuntimeJs}\n</script>\n<script>\n${assets.overviewPlannerRuntimeJs}\n</script>\n<script>\n${assets.overviewExecutionRuntimeJs}\n</script>\n<script>\n${assets.homePageJs}\n</script>`
  );

  return html;
}

function inlineEmbeddedPageHtml(indexHtml, assets) {
  let html = indexHtml;

  html = html.replace(
    /<link rel="stylesheet" href="\.\/style\.css">/i,
    `<style>\n${assets.css}\n<\/style>`
  );

  html = html.replace(
    /<script src="\.\/index\.js"><\/script>/i,
    `<script>\n${assets.js}\n</script>`
  );

  return html;
}

async function collectEmbeddedPages() {
  const embeddedPages = {};
  const actDir = path.join(dashboardEmbedsDir, 'act');
  let entries = [];

  try {
    entries = await fs.readdir(actDir, { withFileTypes: true });
  } catch (_) {
    return embeddedPages;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const embedId = entry.name;
    const embedDir = path.join(actDir, embedId);
    const indexPath = path.join(embedDir, 'index.html');
    const cssPath = path.join(embedDir, 'style.css');
    const jsPath = path.join(embedDir, 'index.js');

    const hasAllAssets = await Promise.all([
      pathExists(indexPath),
      pathExists(cssPath),
      pathExists(jsPath)
    ]);

    if (hasAllAssets.some((exists) => !exists)) continue;

    const [indexHtml, css, js] = await Promise.all([
      read(indexPath),
      read(cssPath),
      read(jsPath)
    ]);

    embeddedPages[embedId] = inlineEmbeddedPageHtml(indexHtml, { css, js });
  }

  return embeddedPages;
}

async function main() {
  const [indexHtml, themeCss, css, dossierCss, expansionCss, svgLibraryJs, charactersJs, utilsJs, bridgeJs, dossierJs, expansionJs, scriptJs, homeCss, overviewTavernConfigJs, overviewCampaignRuntimeJs, overviewPlannerRuntimeJs, overviewExecutionRuntimeJs, homePageJs, template, miniLogoCss, miniLogoJs, embeddedPages] = await Promise.all([
    read(path.join(dashboardAppDir, 'index.html')),
    read(path.join(dashboardAppDir, 'shared', 'theme.css')),
    read(path.join(dashboardAppDir, 'shell', 'shell.css')),
    read(path.join(dashboardAppDir, 'pages', 'dossier', 'style.css')),
    read(path.join(dashboardAppDir, 'pages', 'expansion', 'style.css')),
    read(path.join(dashboardAppDir, 'shared', 'svg-library.js')),
    read(path.join(dashboardAppDir, 'shared', 'characters.js')),
    read(path.join(dashboardAppDir, 'shared', 'utils.js')),
    read(path.join(dashboardAppDir, 'shell', 'bridge.js')),
    read(path.join(dashboardAppDir, 'pages', 'dossier', 'index.js')),
    read(path.join(dashboardAppDir, 'pages', 'expansion', 'index.js')),
    read(path.join(dashboardAppDir, 'shell', 'shell.js')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'style.css')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'config.tavern.js')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'campaign-runtime.js')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'planner-runtime.js')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'execution-runtime.js')),
    read(path.join(dashboardAppDir, 'pages', 'overview', 'index.js')),
    read(templatePath),
    read(miniLogoCssPath),
    read(miniLogoJsPath),
    collectEmbeddedPages()
  ]);

  const embeddedPagesJson = JSON.stringify(embeddedPages)
    .replace(/<\/script>/gi, '<\\/script>');

  const html = inlineDashboardHtml(indexHtml, { themeCss, css, dossierCss, expansionCss, svgLibraryJs, charactersJs, utilsJs, bridgeJs, dossierJs, expansionJs, scriptJs, homeCss, overviewTavernConfigJs, overviewCampaignRuntimeJs, overviewPlannerRuntimeJs, overviewExecutionRuntimeJs, homePageJs, embeddedPages, embeddedPagesJson });
  const escapedHtml = JSON.stringify(html)
    .replace(/<\/script>/gi, '<\\/script>');
  const output = template
    .replace('__DASHBOARD_HTML__', escapedHtml)
    .replace('__MINI_LOGO_CSS__', miniLogoCss)
    .replace('__MINI_LOGO_JS__', miniLogoJs);

  await fs.writeFile(outputPath, output, 'utf8');
  console.log(`Built ${path.relative(repoRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
