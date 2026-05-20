/* Shared dashboard UI helpers. Plain global script. */
(function(root) {
    'use strict';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isPlainRecord(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function clampNumber(value, min, max, fallback = 0) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(min, Math.min(max, Math.round(n)));
    }

    function translateMoveName(moveName) {
        return root.Locale?.move ? root.Locale.move(moveName) : (moveName || '—');
    }

    function translatePokemonNameApp(pokemonId) {
        return root.Locale?.pokemon ? root.Locale.pokemon(pokemonId) : (pokemonId ? String(pokemonId).replace(/[-_]/g, ' ') : '???');
    }

    function buildNarrativeInputText(title, bodyLines, options = {}) {
        const guardLine = options.guardLine || 'Variables have already been updated in the current message MVU state (stat_data.pkm) by the dashboard. Do not output any variable update block.';
        return `[System Event: ${title}]
${guardLine}

[Narrative Request]
${(bodyLines || []).filter(Boolean).join('\n')}`;
    }

    function showMovePoolNotification(message, type = 'info') {
        const colors = {
            success: '#00b894',
            warning: '#fdcb6e',
            error: '#ff7675',
            info: '#74b9ff'
        };
        const notif = document.createElement('div');
        notif.className = 'mpm-notification';
        notif.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10001;
            animation: mpmNotifIn 0.3s ease;
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'mpmNotifOut 0.3s ease forwards';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    function showDashboardNotice(title, body = '', success = true) {
        const old = document.querySelector('.tavern-input-notification');
        if (old) old.remove();
        const notif = document.createElement('div');
        notif.className = 'tavern-input-notification show';
        const color = success ? '#00b894' : '#ff7675';
        const icon = success
            ? '<path d="M20 6L9 17l-5-5"></path>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        notif.innerHTML = `
            <div class="tavern-input-notif-internal">
                <div class="tavern-input-notif-icon" style="color:${color};">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
                </div>
                <div class="tavern-input-notif-text">
                    <div class="tavern-input-notif-title" style="color:${color};">${escapeHtml(title)}</div>
                    <div class="tavern-input-notif-desc">${escapeHtml(body)}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2600);
    }

    function showTavernInputNotification(message) {
        showDashboardNotice('SYSTEM READY', message || '叙事提示已写入酒馆输入栏', true);
    }

    function isDashboardPerformanceEnabled(state = root.db) {
        const settings = state?.settings || state?.player?.settings || {};
        return settings.enableBattlePerformanceMode === true;
    }

    function renderDashboardPerformanceBadge() {
        return '<div class="perf-pill" data-dashboard-perf-indicator title="Performance mode"><span>PERF</span></div>';
    }

    function syncDashboardPerformanceMode(state = root.db) {
        const enabled = isDashboardPerformanceEnabled(state);
        const rootEl = document.documentElement;
        const bodyEl = document.body;
        rootEl?.classList.toggle('dashboard-perf-mode', enabled);
        bodyEl?.classList.toggle('dashboard-perf-mode', enabled);
        const message = { type: 'PKM_DASHBOARD_PERFORMANCE_MODE', enabled };
        document.querySelectorAll('iframe').forEach((frame) => {
            try { frame.contentWindow?.postMessage(message, '*'); } catch (e) {}
        });
        try {
            if (typeof root.onDashboardPerformanceModeChange === 'function') {
                root.onDashboardPerformanceModeChange(enabled, state);
            }
        } catch (e) {
            console.warn('[PKM] dashboard performance sync hook failed:', e);
        }
        document.querySelectorAll('[data-dashboard-perf-indicator]').forEach((el) => {
            el.classList.toggle('active', enabled);
            el.classList.toggle('idle', !enabled);
            el.setAttribute('aria-label', enabled ? 'Performance mode active' : 'Performance mode inactive');
            el.setAttribute('title', enabled ? 'Performance mode active' : 'Performance mode inactive');
        });
        return enabled;
    }

    function buildGenderMark(gender) {
        const genderKey = (gender || '').toUpperCase();
        if (genderKey === 'M') return '<span class="gender-mark male">♂</span>';
        if (genderKey === 'F') return '<span class="gender-mark female">♀</span>';
        return '<span class="gender-mark neutral">∅</span>';
    }

    const getItemBadge = (slug) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

    function triggerBagAccessDenied(el) {
        if (!el) return;
        el.classList.add('is-pressing');
        setTimeout(() => el.classList.remove('is-pressing'), 180);
        showDashboardNotice('ACCESS DENIED', '战术背包尚未激活或内容为空。', false);
    }

    function toggleMechBar() {
        const mechBar = document.getElementById('mech-bar');
        if (!mechBar) return;
        const wrapper = mechBar.closest('.mech-wrapper');
        const mechBtn = wrapper ? wrapper.querySelector('.mech-btn') : document.querySelector('.mech-btn');
        const isExpanded = mechBar.classList.toggle('expanded');
        if (mechBtn) mechBtn.classList.toggle('open', isExpanded);
    }

    function toggleCard(cardElement) {
        if (!cardElement || cardElement.classList.contains('empty')) return;
        cardElement.classList.toggle('open');
    }

    function toggleAVS(event, slotKey) {
        event.stopPropagation();
        const panel = document.getElementById(`avs-panel-${slotKey}`);
        const btn = event.currentTarget;
        if (!panel || !btn) return;
        const isVisible = panel.classList.toggle('visible');
        btn.classList.toggle('active', isVisible);
        document.querySelectorAll('.avs-dashboard.visible').forEach(el => {
            if (el !== panel) el.classList.remove('visible');
        });
        document.querySelectorAll('.avs-action.active').forEach(el => {
            if (el !== btn) el.classList.remove('active');
        });
    }

    async function toggleLeader(event, slotKey) {
        if (event) event.stopPropagation();
        const slot = Number(String(slotKey).replace('slot', '')) || 1;
        try {
            await root.postPkmAction('party.setLead', { slot });
        } catch (error) {
            console.error('[PKM] Leader 写入失败:', error);
            if (typeof root.showPkmActionFailure === 'function') {
                root.showPkmActionFailure(`队长切换失败：${error.message}`);
            }
        }
    }

    function installPartyRenderer(config = {}) {
        const getDb = config.getDb || (() => root.db);
        const renderAffinityPanel = config.renderAffinityPanel || ((pkm, slotKey, helpers) => {
            const bondsValue = pkm?.bonds || 0;
            return `
        <div class="avs-dashboard" id="avs-panel-${slotKey}" onclick="event.stopPropagation()">
            <div class="avs-stat-item asi-stat-bonds">
                <span class="asi-label">BONDS</span>
                <span class="asi-val ${helpers.maxCheck(bondsValue)}">${bondsValue}</span>
            </div>
        </div>`;
        });

        function getMoveValue(moves, key, index) {
            if (Array.isArray(moves)) return moves[index] || null;
            return moves?.[key] || null;
        }

        function createCardHTML(pkm, slotIdStr) {
            if (!pkm || !pkm.name) {
                const slotNum = String(slotIdStr).replace('slot', '0');
                return `
        <div class="dash-card-box empty">
            <div class="dcb-inner">
                <span class="empty-placeholder">SLOT ${slotNum} OPEN</span>
            </div>
        </div>`;
            }

            const isLead = pkm.isLead === true;
            const slotDisplay = (`0${pkm.slot}`).slice(-2);
            const speciesName = pkm.species || pkm.name;
            const rawSlug = String(speciesName).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const spriteSlug = (typeof root.buildSpriteSlug === 'function' ? root.buildSpriteSlug(speciesName) : rawSlug) || rawSlug;
            const showdownSlug = spriteSlug.replace(/[^a-z0-9-]/g, '');
            const hasRegionalSuffix = /-(hisui|alola|galar|paldea)$/.test(showdownSlug);
            const slugPixel = hasRegionalSuffix ? showdownSlug : showdownSlug.replace(/-/g, '');
            let urlSv = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${spriteSlug}.png`;
            let urlSwsh = `https://img.pokemondb.net/sprites/sword-shield/normal/${spriteSlug}.png`;
            let urlPx = `https://play.pokemonshowdown.com/sprites/gen5/${slugPixel}.png`;
            let regionalClass = '';
            if (/-hisui$/.test(showdownSlug)) {
                urlSv = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
                urlSwsh = `https://play.pokemonshowdown.com/sprites/ani/${showdownSlug}.gif`;
                urlPx = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
                regionalClass = 'regional-sprite';
            } else if (hasRegionalSuffix) {
                regionalClass = 'regional-sprite';
            }

            const theme = root.getThemeColors(speciesName);
            const itemUrl = root.getItemIconUrl(pkm.item);
            const itemUrlPS = root.getItemIconUrlPS(pkm.item);
            const maxCheck = (val) => val >= 255 ? 'maxed' : '';
            let displayName = pkm.nickname || pkm.name;
            if (!pkm.nickname && pkm.species) displayName = translatePokemonNameApp(pkm.species);
            if (displayName && /^[a-zA-Z\s-]+$/.test(displayName)) displayName = displayName.toUpperCase();

            const genderHtml = buildGenderMark(pkm.gender);
            const shinyBadge = pkm.shiny ? '<span class="shiny-mark">✨</span>' : '';
            const boxClass = isLead ? 'dash-card-box is-leader' : 'dash-card-box';
            const leaderBadgeHtml = isLead ? '<div class="lead-tag"><span class="lead-text">LEAD</span></div>' : '';
            const actionClass = isLead ? 'leader-action active' : 'leader-action';
            const actionTitle = isLead ? 'Current Point Pokemon' : 'Set to Leader';
            const clickHandler = isLead ? '' : `onclick="toggleLeader(event, '${slotIdStr}')"`;
            const leaderBtnHtml = `
        <div class="${actionClass}" ${clickHandler} title="${actionTitle}">
            <svg viewBox="0 0 24 24">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
        </div>`;
            const typeChips = theme.types.map(t => `<div class="type-mini" style="background:${root.getTypeColor(t)}"><span>${t.toUpperCase()}</span></div>`).join('');
            const moveOrder = ['move1', 'move2', 'move3', 'move4'];
            const movesHtml = moveOrder.map((key, index) => {
                const moveName = getMoveValue(pkm.moves, key, index);
                return moveName
                    ? `<div class="k-move-shell"><span>${translateMoveName(moveName)}</span></div>`
                    : '<div class="k-move-shell empty"><span>—</span></div>';
            }).join('');
            const statMap = { hp: 'H', atk: 'A', def: 'B', spa: 'C', spd: 'D', spe: 'S' };
            const ivs = pkm.stats_meta?.ivs || {};
            const ivsHtml = Object.keys(statMap).map(key => {
                const val = ivs[key] || 0;
                return `<div class="chip-cell ${val === 31 ? 'max' : ''}" data-stat="${statMap[key]}">${val}</div>`;
            }).join('');
            const itemHtml = pkm.item
                ? `<div class="item-box" data-name="${escapeHtml(pkm.item)}">
            <img src="${itemUrl}" alt="${escapeHtml(pkm.item)}" onerror="if(!this.dataset.triedPS){this.dataset.triedPS=true;this.src='${itemUrlPS}';}else{this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';}" />
          </div>`
                : '';
            const affinityHtml = renderAffinityPanel(pkm, slotIdStr, { maxCheck, escapeHtml });

            return `
    <div class="${boxClass}" data-slot="${slotDisplay}" onclick="toggleCard(this)" style="--prim-color: ${theme.p}; --sec-color: ${theme.s}; cursor: pointer;">
        <div class="dcb-inner card-layout">
            <div class="pkm-summary" data-slot="${slotDisplay}">
                ${affinityHtml}
                <div class="p-visual-grp">
                    <div class="p-avatar">
                        <img src="${urlSv}" loading="lazy" alt="${escapeHtml(pkm.species || pkm.name)}" class="${regionalClass}" onerror="if (!this.dataset.triedSwsh) { this.dataset.triedSwsh = true; this.src = '${urlSwsh}'; } else { this.onerror = null; this.src = '${urlPx}'; this.className = 'pixel-fallback'; }" style="transition: 0.2s;">
                    </div>
                    <div class="p-texts">
                        <div class="p-meta-line">
                            <span>NO.${slotDisplay}</span>
                            <span>Lv.<b class="p-lv-val">${pkm.lv}</b></span>
                            ${shinyBadge}
                            ${leaderBadgeHtml}
                        </div>
                        <div class="p-name">${escapeHtml(displayName)}${genderHtml}</div>
                    </div>
                </div>
                <div class="summary-actions">
                    ${leaderBtnHtml}
                    <div class="build-action" onclick="event.stopPropagation(); openMovePoolPanel('${slotIdStr}')" title="Adjust Moves">
                        <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <div class="avs-action" onclick="toggleAVS(event, '${slotIdStr}')" title="Affinity Gauge">
                        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div class="expand-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                </div>
            </div>
            <div class="pkm-details">
                <div class="details-overflow">
                    <div class="detail-padder tech-mode">
                        <div class="top-rail">
                            <div class="element-grp">${typeChips}</div>
                            <div class="meta-chips">
                                <div class="m-tag nature"><span>${escapeHtml(pkm.nature)}</span></div>
                                <div class="m-tag ability"><span>${escapeHtml(pkm.ability)}</span></div>
                            </div>
                            ${itemHtml}
                        </div>
                        <div class="kinetic-moves">${movesHtml}</div>
                        <div class="bot-stat-strip">
                            <div class="ivs-group"><span class="micro-lbl">IVs</span><div class="hex-chips">${ivsHtml}</div></div>
                            <div class="evs-group"><span class="micro-lbl">TOTAL EVs</span><span class="evs-val">${pkm.stats_meta ? pkm.stats_meta.ev_level : 0}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
        }

        function renderPartyList() {
            const mainEl = document.getElementById('inject-viewport');
            if (!mainEl) {
                console.error('[PKM] inject-viewport 元素不存在');
                return;
            }
            const partyData = getDb()?.player?.party || {};
            const displaySlotKeys = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6'];
            const displaySlots = displaySlotKeys.map(key => partyData[key]).filter(Boolean);
            const activeCount = displaySlots.filter(p => p?.name).length;
            const dotsHtml = displaySlotKeys.map((_, index) => `<div class="th-dot ${index < activeCount ? 'active' : ''}"></div>`).join('');
            const headerHtml = `
    <div class="team-header-dash">
        <div class="th-title">DEPLOYED UNIT</div>
        <div class="th-status-grp">
            <div class="th-slots-viz">${dotsHtml}</div>
            <div class="th-count">0${activeCount} <small>/ 06</small></div>
        </div>
    </div>`;
            const cardsHTML = displaySlotKeys.map(slotKey => partyData[slotKey] ? createCardHTML(partyData[slotKey], slotKey) : '').join('');
            const partyPage = document.getElementById('pg-party');
            if (partyPage) {
                partyPage.innerHTML = headerHtml + cardsHTML;
            } else {
                mainEl.innerHTML = `<div id="pg-party" class="page curr">${headerHtml + cardsHTML}</div><div id="pg-social" class="page"></div><div id="pg-settings" class="page"></div>`;
            }
        }

        Object.assign(root, { createCardHTML, renderPartyList });
        return { createCardHTML, renderPartyList };
    }

    const DefaultSettingsManifest = [
        { key: 'enableAVS', label: 'AVS SYSTEM', desc: 'Affective Value System (Trust/Passion/Insight)', color: '#ff7675' },
        { key: 'enableCommander', label: 'CMD. INTERFACE', desc: 'Enable real-time tactical order injections.', color: '#fdcb6e' },
        { key: 'enableEVO', label: 'LIMIT BREAK', desc: 'Allow Mid-Battle Evolution (Bio/Bond triggers)', color: '#00cec9' },
        { key: 'enableBGM', label: 'DYN. AUDIO', desc: 'Narrative-driven background music adaptation.', color: '#74b9ff' },
        { key: 'enableSFX', label: 'SFX FEEDBACK', desc: 'SillyTavern UI Sound Effects pack.', color: '#a29bfe' },
        { key: 'enableClash', label: 'CLASH SYSTEM', desc: 'Enable clash mechanics during battle.', color: '#e17055' },
        { key: 'enableEnvironment', label: 'ENVIRONMENT', desc: 'Enable weather & terrain effects in battle.', color: '#55efc4' },
        { key: 'enableBattlePerformanceMode', label: 'PERF. MODE', desc: 'Disable heavy VFX, filters, shadows and weather particles.', color: '#95a5a6' },
        { key: 'enableBattlePortraitMode', label: 'PORTRAIT UI', desc: 'Use the vertical 720x1100 battle layout.', color: '#4fabff' },
        { key: 'enableEnemyStrategicSwitching', label: 'ENEMY PIVOT AI', desc: 'Allow enemy AI to actively switch when threatened or disadvantaged.', color: '#ff9f43' }
    ];

    function installSettings(config = {}) {
        const getDb = config.getDb || (() => root.db);
        const setDb = config.setDb || ((value) => { root.db = value; });
        const manifest = config.manifest || DefaultSettingsManifest;
        const resolveDefaults = () => {
            const defaults = typeof config.defaultSettings === 'function' ? config.defaultSettings() : config.defaultSettings;
            return { ...(defaults || {}) };
        };
        const normalizeSettings = config.normalizeSettings || ((rawSettings, defaults) => ({ ...defaults, ...(rawSettings || {}) }));
        const buildPatch = config.buildPatch || ((key, value) => ({ [key]: value }));

        function ensureSettingsDefaults() {
            let state = getDb();
            if (!state) {
                state = {};
                setDb(state);
            }
            state.settings = normalizeSettings(state.settings || {}, resolveDefaults(), state);
            syncDashboardPerformanceMode(state);
        }

        function renderSettings() {
            const pageEl = document.getElementById('pg-settings');
            if (!pageEl) return;
            const state = getDb() || {};
            syncDashboardPerformanceMode(state);
            const activeCount = manifest.filter(item => state.settings?.[item.key] === true).length;
            const cardsHtml = manifest.map(item => {
                const isActive = state.settings?.[item.key] === true;
                return `
            <div class="cfg-card ${isActive ? 'active' : ''}" style="--cfg-color:${item.color}" onclick="toggleGlobalSetting('${item.key}')">
                <div class="cfg-info">
                    <span class="cfg-label">${escapeHtml(item.label)}</span>
                    <span class="cfg-desc">${escapeHtml(item.desc)}</span>
                </div>
                <div class="tgl-track ${isActive ? 'active' : ''}">
                    <div class="tgl-thumb"></div>
                </div>
            </div>`;
            }).join('');
            pageEl.innerHTML = `
    <div class="team-header-dash">
        <div class="th-title">SYSTEM KERNEL</div>
        <div class="th-status-grp">
            <div class="th-count">${activeCount} <small>MODULES ACTIVE</small></div>
        </div>
    </div>
    <div class="config-grid">${cardsHtml}</div>`;
        }

        root.toggleGlobalSetting = async function toggleGlobalSetting(key) {
            let state = getDb();
            if (!state) {
                state = {};
                setDb(state);
            }
            if (!state.settings) state.settings = normalizeSettings({}, resolveDefaults(), state);
            const previousSettings = { ...state.settings };
            const nextValue = state.settings[key] !== true;
            const settingsPatch = buildPatch(key, nextValue, state);
            state.settings = { ...state.settings, ...settingsPatch };
            console.log('[PKM CONFIG] Setting Changed:', settingsPatch);
            syncDashboardPerformanceMode(state);
            renderSettings();
            try {
                await root.postPkmAction('settings.update', settingsPatch);
            } catch (error) {
                console.error('[PKM CONFIG] Setting write failed:', error);
                state.settings = previousSettings;
                syncDashboardPerformanceMode(state);
                renderSettings();
                root.showPkmActionFailure(`设置写入失败：${error.message}`);
            }
        };

        Object.assign(root, { ensureSettingsDefaults, renderSettings });
        return { ensureSettingsDefaults, renderSettings, toggleGlobalSetting: root.toggleGlobalSetting };
    }

    function renderDashboardPage(pageId) {
        if (pageId === 'box' && typeof root.renderBoxPage === 'function') root.renderBoxPage();
        else if (pageId === 'dashboard' && typeof root.renderDashboard === 'function') root.renderDashboard();
        else if (pageId === 'party' && typeof root.renderPartyList === 'function') root.renderPartyList();
        else if (pageId === 'social' && typeof root.renderSocialList === 'function') root.renderSocialList();
        else if (pageId === 'settings' && typeof root.renderSettings === 'function') root.renderSettings();
        else if (pageId === 'transit' && typeof root.renderTransitPage === 'function') root.renderTransitPage();
    }

    function switchPage(targetId, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));
        const target = document.getElementById(`pg-${targetId}`);
        if (target) {
            target.classList.add('curr');
            if (targetId !== 'dashboard') target.classList.add('sub-page');
        }
        renderDashboardPage(targetId);
        const sb = document.getElementById('sticky-status-bar');
        if (sb) {
            if (targetId === 'dashboard') sb.classList.remove('sub-mode');
            else sb.classList.add('sub-mode');
        }
    }

    function openAppPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));
        const target = document.getElementById(`pg-${pageId}`);
        if (target) {
            target.classList.add('curr', 'sub-page');
            renderDashboardPage(pageId);
        }
        const sb = document.getElementById('sticky-status-bar');
        if (sb) sb.classList.add('sub-mode');
    }

    function goBackToHome() {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));
        const dashPage = document.getElementById('pg-dashboard');
        if (dashPage) {
            dashPage.classList.add('curr');
            if (typeof root.renderDashboard === 'function') root.renderDashboard();
        }
        const sb = document.getElementById('sticky-status-bar');
        if (sb) sb.classList.remove('sub-mode');
    }

    function getSvgIcon(code) {
        const svgs = {
            'mega': '<svg viewBox="0 0 14 17.5" fill="currentColor"><g><path d="M3.88792,10.9 C5.96264,10.9,8.03736,10.9,10.1121,10.9 C11.0183,10.9426,11.0183,9.45744,10.1121,9.5 C8.03736,9.5,5.96264,9.5,3.88792,9.5 C2.98166,9.45744,2.98166,10.9426,3.88792,10.9 z"/><path d="M2.75289,2 C2.75289,2.10488,2.75289,2.20976,2.75289,2.31464 C2.75355,4.80881,4.40963,6.99632,6.81004,7.67374 C8.60567,8.17928,9.84777,9.81993,9.84711,11.6854 C9.84711,11.7903,9.84711,11.8951,9.84711,12 C9.80455,12.9063,11.2897,12.9063,11.2471,12 C11.2471,11.8951,11.2471,11.7903,11.2471,11.6854 C11.2464,9.19119,9.59033,7.00368,7.18992,6.32626 C5.39429,5.82072,4.15223,4.18007,4.15289,2.31464 C4.15289,2.20976,4.15289,2.10488,4.15289,2 C4.19545,1.09374,2.71033,1.09374,2.75289,2 z"/><g><path d="M6.99988,6.26793 C6.93733,6.28879,6.87403,6.30825,6.81004,6.32626 C4.40962,7.00368,2.75355,9.1912,2.75289,11.6854 C2.75289,11.6854,2.75289,12,2.75289,12 C2.71033,12.9063,4.19545,12.9063,4.15289,12 C4.15289,12,4.15289,11.6854,4.15289,11.6854 C4.15223,9.81992,5.3943,8.17928,7.18992,7.67374 C7.73053,7.52117,8.23338,7.29202,8.68807,7.00001 C8.23346,6.70808,7.73068,6.47894,7.19012,6.32632 C7.12599,6.30829,7.06257,6.28881,6.99988,6.26793 z"/><path d="M8.21185,5.62527 C9.21994,4.85339,9.84758,3.64081,9.84711,2.31464 C9.84711,2.31464,9.84711,2,9.84711,2 C9.80455,1.09375,11.2897,1.09374,11.2471,2 C11.2471,2,11.2471,2.31464,11.2471,2.31464 C11.2467,3.88075,10.5936,5.32595,9.51336,6.35232 C9.1132,6.06454,8.67745,5.81966,8.21185,5.62527 z"/></g><g><path d="M6.02737,4.5 C6.02737,4.5,10.1121,4.5,10.1121,4.5 C11.0183,4.54256,11.0183,3.05744,10.1121,3.1 C10.1121,3.1,5.2513,3.1,5.2513,3.1 C5.38672,3.62909,5.65656,4.11049,6.02737,4.5 z"/></g></g></svg>',
            'z': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 2L4 13h6l-2 9 9.5-12H10l3-8z"/></svg>',
            'dmax': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.5l6.5 13h-13L12 5.5zM12 8l-2 4h4l-2-4z"/></svg>',
            'tera': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-9.5 5.5v9L12 22l9.5-5.5v-9L12 2zM12 19.5L5.5 15.8v-7.6L12 4.5l6.5 3.7v7.6L12 19.5z"/><path d="M12 7.5L8 10l4 2.5 4-2.5-4-2.5z"/></svg>',
            'bond': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
            'style': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 93.75" fill="currentColor"><path transform="scale(.75)" d="m50 5.8594c-11.79 0-22.876 4.5903-31.213 12.928-8.3374 8.3366-12.928 19.422-12.928 31.213s4.5903 22.874 12.928 31.211c2.8053 2.8061 5.9253 5.1857 9.2754 7.1113-2.8564-4.2252-4.5273-9.3145-4.5273-14.787 0-14.593 11.872-26.465 26.465-26.465 11.362 0 20.605-9.2438 20.605-20.605s-9.2438-20.605-20.605-20.605zm21.939 5.8184c2.8572 4.2252 4.5254 9.3146 4.5254 14.787 0 14.593-11.872 26.465-26.465 26.465-11.362 0-20.605 9.2438-20.605 20.605s9.2438 20.605 20.605 20.605c11.79 0 22.876-4.5923 31.213-12.93 8.3374-8.3367 12.928-19.42 12.928-31.211s-4.5903-22.876-12.928-31.213c-2.8053-2.8061-5.9234-5.1837-9.2734-7.1094zm-21.939 3.0625c6.4652 0 11.725 5.2602 11.725 11.725 0 6.4644-5.2595 11.723-11.725 11.723-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4651 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652-2e-6 3.2341 2.6311 5.8633 5.8652 5.8633 3.2341 0 5.8652-2.6292 5.8652-5.8633 0-3.2341-2.6311-5.8652-5.8652-5.8652zm0 41.211c6.4652 0 11.725 5.2594 11.725 11.725s-5.2595 11.723-11.725 11.723c-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4652 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652s2.6311 5.8633 5.8652 5.8633c3.2341-1e-6 5.8652-2.6292 5.8652-5.8633s-2.6311-5.8652-5.8652-5.8652z" stroke-width=".19531"/></svg>',
            'eye': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
            'cap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>'
        };
        return svgs[code] || '';
    }
    

    Object.assign(root, {
        escapeHtml,
        isPlainRecord,
        clampNumber,
        translateMoveName,
        translatePokemonNameApp,
        buildNarrativeInputText,
        showMovePoolNotification,
        showDashboardNotice,
        showTavernInputNotification,
        isDashboardPerformanceEnabled,
        renderDashboardPerformanceBadge,
        syncDashboardPerformanceMode,
        buildGenderMark,
        getItemBadge,
        getSvgIcon,
        triggerBagAccessDenied,
        toggleMechBar,
        toggleCard,
        toggleAVS,
        toggleLeader,
        installPartyRenderer,
        installSettings,
        switchPage,
        openAppPage,
        goBackToHome
    });

    root.DashboardUICommon = {
        escapeHtml,
        isPlainRecord,
        clampNumber,
        translateMoveName,
        translatePokemonNameApp,
        buildNarrativeInputText,
        showMovePoolNotification,
        showDashboardNotice,
        showTavernInputNotification,
        isDashboardPerformanceEnabled,
        renderDashboardPerformanceBadge,
        syncDashboardPerformanceMode,
        buildGenderMark,
        getItemBadge,
        getSvgIcon,
        triggerBagAccessDenied,
        toggleMechBar,
        toggleCard,
        toggleAVS,
        toggleLeader,
        installPartyRenderer,
        installSettings,
        switchPage,
        openAppPage,
        goBackToHome
    };
    root.DashboardPartyRenderer = { install: installPartyRenderer };
    root.DashboardSettings = { install: installSettings, manifest: DefaultSettingsManifest };
})(typeof globalThis !== 'undefined' ? globalThis : window);
