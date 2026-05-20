/* Shared dashboard PC box manager. Plain global script. */
(function(root) {
    'use strict';

    function installBoxManager(config = {}) {
        const getDb = config.getDb || (() => root.db);
        const product = config.product || 'dashboard';
        const boxInputSource = config.boxInputSource || `${product}:box`;
        const getZoneName = config.getZoneName || (() => '未知区域');
        const beforeRender = config.beforeRender || (async () => ({ isLocked: false, overlayHtml: '' }));
        const createEmptySlot = config.createEmptySlot || ((slotNum) => ({
            slot: slotNum,
            name: null,
            nickname: null,
            species: null,
            gender: null,
            lv: null,
            quality: null,
            nature: null,
            ability: null,
            shiny: false,
            item: null,
            mechanic: null,
            teraType: null,
            isAce: false,
            isLead: false,
            bonds: 0,
            moves: { move1: null, move2: null, move3: null, move4: null },
            stats_meta: {
                ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
                ev_level: 0
            },
            notes: null
        }));

        const boxState = {
            selectedPartIdxs: [],
            selectedBoxKeys: [],
            selectedEmptyIdxs: [],
            isLocked: false,
            signalStatus: null
        };
        root.boxState = boxState;
        if (!root._pkmIconVerifyCache) root._pkmIconVerifyCache = {};

        function generateSmartIconHex(name, cssClass = '') {
            if (!name) return '';
            const rawSlug = String(name).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const spriteSlug = (typeof root.buildSpriteSlug === 'function' ? root.buildSpriteSlug(name) : rawSlug) || rawSlug;
            const showdownSlug = spriteSlug.replace(/[^a-z0-9-]/g, '');
            const showdownMenuSlug = showdownSlug.replace(/-/g, '');
            const cacheKey = spriteSlug || showdownMenuSlug;
            const hasRegionalSuffix = /-(hisui|alola|galar|paldea)$/.test(spriteSlug);
            const finalClass = [cssClass, hasRegionalSuffix ? 'regional-icon' : ''].filter(Boolean).join(' ');

            let src1 = `https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/${spriteSlug}.png`;
            let src2 = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
            let src3 = `https://play.pokemonshowdown.com/sprites/menu/${showdownMenuSlug}.png`;
            const src4 = 'https://img.pokemondb.net/sprites/black-white/anim/normal/unown-q.gif';
            if (spriteSlug === 'zorua-hisui') {
                src1 = 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/zorua-hisui.png';
                src2 = 'https://play.pokemonshowdown.com/sprites/gen5/zorua-hisui.png';
                src3 = 'https://play.pokemonshowdown.com/sprites/menu/zoruahisui.png';
            }
            if (root._pkmIconVerifyCache[cacheKey]) {
                return `<img src="${root._pkmIconVerifyCache[cacheKey]}" class="${finalClass}" loading="lazy">`;
            }
            return `<img src="${src1}" loading="lazy" class="${finalClass}"
                onload="window._pkmIconVerifyCache['${cacheKey}'] = this.src"
                onerror="
                    if(!this.dataset.step){ this.dataset.step = 1; this.src='${src2}'; }
                    else if(this.dataset.step == 1){ this.dataset.step = 2; this.src='${src3}'; }
                    else { this.onerror = null; this.style.opacity = 0.5; this.src='${src4}'; }
                ">`;
        }

        function renderBoxPartyCard(pkm, idx) {
            const isSelected = boxState.selectedPartIdxs.includes(idx);
            const isEmpty = (!pkm || !pkm.name);
            if (isEmpty) {
                return `<div class="box-char-card empty ${isSelected ? 'selected' : ''}" onclick="handlePartyClick(${idx})"><div class="bcc-inner"><span class="bcc-name">EMPTY SLOT</span></div></div>`;
            }
            const theme = root.getThemeColors(pkm.name);
            const displayName = pkm.nickname || root.translatePokemonNameApp(pkm.name);
            return `
                <div class="box-char-card ${isSelected ? 'selected' : ''}" onclick="handlePartyClick(${idx})">
                    <div class="bcc-inner">
                        <div class="bcc-icon">${generateSmartIconHex(pkm.name)}</div>
                        <div class="bcc-info">
                            <div class="bcc-name">${displayName}</div>
                            <div class="bcc-lv">Lv.${pkm.lv} ${root.buildGenderMark(pkm.gender)}</div>
                        </div>
                        <div class="bcc-type" style="background:${theme.p}"></div>
                    </div>
                </div>`;
        }

        function renderStorageCell(pkm, key, cellIndex) {
            const isSelected = key ? boxState.selectedBoxKeys.includes(key) : boxState.selectedEmptyIdxs.includes(cellIndex);
            if (!pkm) {
                return `<div class="storage-cell empty ${isSelected ? 'selected' : ''}" onclick="handleEmptyBoxClick(${cellIndex})"></div>`;
            }
            return `
                <div class="storage-cell ${isSelected ? 'selected' : ''}" onclick="handleBoxClick('${key}')">
                    ${generateSmartIconHex(pkm.name, 'sc-img')}
                    <span class="sc-lv">L.${pkm.lv}</span>
                    ${pkm.shiny ? '<span class="sc-shiny">★</span>' : ''}
                </div>`;
        }

        async function renderBoxPage() {
            const db = getDb();
            const boxPage = document.getElementById('pg-box');
            if (!boxPage || !db?.player?.party) return;

            const guard = await beforeRender({ db, boxState });
            boxState.isLocked = guard?.isLocked === true;
            boxState.signalStatus = guard?.signalStatus || null;
            boxPage.classList.toggle('locked', boxState.isLocked);

            let html = '<div class="box-header-strip storage-green"><span class="box-header-title">CURRENT PARTY (HAND)</span></div>';
            html += '<div class="box-party-grid">';
            for (let i = 1; i <= 6; i++) {
                html += renderBoxPartyCard(db.player.party[`slot${i}`], i - 1);
            }
            html += '</div>';
            html += '<div class="box-header-strip storage-green"><span class="box-header-title">CLOUD STORAGE (SERVER)</span></div>';
            html += '<div class="box-storage-area"><div class="box-storage-matrix">';
            const boxEntries = Object.entries(db.player.box || {});
            const totalCells = Math.max(30, boxEntries.length + 5);
            for (let i = 0; i < totalCells; i++) {
                if (i < boxEntries.length) {
                    const [key, pkmData] = boxEntries[i];
                    html += renderStorageCell(pkmData, key, i);
                } else {
                    html += renderStorageCell(null, null, i);
                }
            }
            html += '</div></div>';
            html += guard?.overlayHtml || '';
            boxPage.innerHTML = html;
        }

        function refreshBoxUI() {
            renderBoxPage();
        }

        function updateOpsBar() {
            const db = getDb();
            const bar = document.getElementById('box-ops-console');
            if (!bar || !db?.player) return;
            const pIdxs = boxState.selectedPartIdxs;
            const bKeys = boxState.selectedBoxKeys;
            const emptyIdxs = boxState.selectedEmptyIdxs;
            if (pIdxs.length === 0 && bKeys.length === 0 && emptyIdxs.length === 0) {
                bar.classList.remove('active');
                return;
            }
            bar.classList.add('active');
            const partyNames = pIdxs.map(idx => db.player.party[`slot${idx + 1}`]?.name || null);
            const filledPartyCount = partyNames.filter(Boolean).length;
            const emptyPartyCount = partyNames.filter(n => n === null).length;
            const boxNames = bKeys.map(key => db.player.box[key]?.name || 'Unknown');
            const prefixStyle = 'style="color: #636e72; font-weight:900; margin-right:6px; opacity:0.8"';
            const countStyle = 'style="color: #0984e3; font-weight:900;"';
            let htmlInner = '';
            const hasParty = pIdxs.length > 0;
            const hasBoxPkm = bKeys.length > 0;
            const hasEmptyBox = emptyIdxs.length > 0;
            if (hasParty && hasEmptyBox && filledPartyCount > 0) {
                htmlInner = filledPartyCount === emptyIdxs.length
                    ? `<span ${prefixStyle}>CMD: BATCH STORE</span> <span ${countStyle}>[${filledPartyCount}]</span> <span class="ops-highlight">${partyNames.filter(Boolean).join(', ')}</span> <span style="color:#b2bec3; margin:0 5px;">»</span> SERVER`
                    : `<span ${prefixStyle}>ERR:</span> <span style="color:#e74c3c;">队伍选中 ${filledPartyCount} 个，空位选中 ${emptyIdxs.length} 个，数量不匹配</span>`;
            } else if (hasParty && hasBoxPkm) {
                if (pIdxs.length === bKeys.length) {
                    if (filledPartyCount === pIdxs.length) {
                        htmlInner = `<span ${prefixStyle}>CMD: BATCH SWAP</span> <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">${partyNames.join(', ')}</span> <span style="color:#00cec9; margin:0 2px;">⇄</span> <span class="ops-highlight">${boxNames.join(', ')}</span>`;
                    } else if (emptyPartyCount === pIdxs.length) {
                        htmlInner = `<span ${prefixStyle}>CMD: BATCH RETRIEVE</span> <span ${countStyle}>[${bKeys.length}]</span> SERVER <span style="color:#b2bec3; margin:0 5px;">»</span> <span class="ops-highlight">${boxNames.join(', ')}</span>`;
                    } else {
                        htmlInner = `<span ${prefixStyle}>CMD: BATCH TRANSFER</span> <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">混合操作</span>`;
                    }
                } else {
                    htmlInner = `<span ${prefixStyle}>ERR:</span> <span style="color:#e74c3c;">队伍选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个，数量不匹配</span>`;
                }
            } else if (hasParty) {
                htmlInner = `<span ${prefixStyle}>STATUS:</span> TARGETING <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">${partyNames.map((n, i) => n || `SLOT${pIdxs[i] + 1}(空)`).join(', ')}</span> <span style="color:#b2bec3">...SELECT BOX</span>`;
            } else if (hasBoxPkm) {
                htmlInner = `<span ${prefixStyle}>STATUS:</span> TARGETING <span ${countStyle}>[${bKeys.length}]</span> <span class="ops-highlight">${boxNames.join(', ')}</span> <span style="color:#b2bec3">...SELECT SLOT</span>`;
            } else if (hasEmptyBox) {
                htmlInner = `<span ${prefixStyle}>STATUS:</span> SELECTED <span ${countStyle}>[${emptyIdxs.length}]</span> EMPTY CELLS <span style="color:#b2bec3">...SELECT PARTY</span>`;
            }
            bar.innerHTML = `<div class="ops-text-row"><div class="ops-log">${htmlInner}</div></div><div class="ops-action-row"><button class="btn-ops-cancel" onclick="resetBoxSelection()">RESET</button><button class="btn-ops-confirm" onclick="confirmBoxTransfer()">EXECUTE</button></div>`;
        }

        root.handlePartyClick = function(idx) {
            if (boxState.isLocked) return;
            const arrIdx = boxState.selectedPartIdxs.indexOf(idx);
            if (arrIdx !== -1) boxState.selectedPartIdxs.splice(arrIdx, 1);
            else boxState.selectedPartIdxs.push(idx);
            refreshBoxUI();
            updateOpsBar();
        };

        root.handleBoxClick = function(key) {
            if (boxState.isLocked || !key) return;
            boxState.selectedEmptyIdxs = [];
            const arrIdx = boxState.selectedBoxKeys.indexOf(key);
            if (arrIdx !== -1) boxState.selectedBoxKeys.splice(arrIdx, 1);
            else boxState.selectedBoxKeys.push(key);
            refreshBoxUI();
            updateOpsBar();
        };

        root.handleEmptyBoxClick = function(cellIndex) {
            if (boxState.isLocked) return;
            boxState.selectedBoxKeys = [];
            const arrIdx = boxState.selectedEmptyIdxs.indexOf(cellIndex);
            if (arrIdx !== -1) boxState.selectedEmptyIdxs.splice(arrIdx, 1);
            else boxState.selectedEmptyIdxs.push(cellIndex);
            refreshBoxUI();
            updateOpsBar();
        };

        root.resetBoxSelection = function() {
            boxState.selectedPartIdxs = [];
            boxState.selectedBoxKeys = [];
            boxState.selectedEmptyIdxs = [];
            document.querySelectorAll('.box-char-card.selected, .storage-cell.selected').forEach(el => el.classList.remove('selected'));
            updateOpsBar();
        };

        function normalizeToPartyFormat(simpleObj, slotNum) {
            return { slot: slotNum, ...simpleObj };
        }

        function normalizeToBoxFormat(partyObj) {
            const clone = JSON.parse(JSON.stringify(partyObj));
            delete clone.slot;
            delete clone.currHp;
            delete clone.maxHp;
            return clone;
        }

        root.confirmBoxTransfer = async function() {
            const db = getDb();
            const pIdxs = boxState.selectedPartIdxs;
            const bKeys = boxState.selectedBoxKeys;
            const emptyIdxs = boxState.selectedEmptyIdxs;
            const hasParty = pIdxs.length > 0;
            const hasBoxPkm = bKeys.length > 0;
            const hasEmptyBox = emptyIdxs.length > 0;
            if (!hasParty) return alert('请先选择队伍槽位。');
            if (!hasBoxPkm && !hasEmptyBox) return alert('请选择盒子中的宝可梦或空白格子。');

            const partyInfos = pIdxs.map(idx => {
                const slotKey = `slot${idx + 1}`;
                const obj = db.player.party[slotKey];
                return { idx, slotKey, obj, name: obj?.name || null };
            });
            const filledPartyInfos = partyInfos.filter(p => p.name !== null);
            const emptyPartyInfos = partyInfos.filter(p => p.name === null);
            const playerName = db.player.name || '训练师';
            const zoneName = getZoneName(db);
            let actionLog = '';
            let mvuzPayload = null;

            if (hasEmptyBox && filledPartyInfos.length > 0) {
                if (filledPartyInfos.length !== emptyIdxs.length) return alert(`数量不匹配：队伍选中 ${filledPartyInfos.length} 个宝可梦，空位选中 ${emptyIdxs.length} 个。`);
                const existingIds = Object.keys(db.player.box || {}).filter(k => k.startsWith('storage_')).map(k => parseInt(k.split('_')[1]) || 0);
                let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
                const boxInserts = {};
                const partyEdits = {};
                const uploadList = [];
                filledPartyInfos.forEach((pInfo) => {
                    const newBoxKey = `storage_${String(nextId++).padStart(2, '0')}`;
                    boxInserts[newBoxKey] = normalizeToBoxFormat(JSON.parse(JSON.stringify(pInfo.obj)));
                    partyEdits[pInfo.slotKey] = createEmptySlot(pInfo.idx + 1);
                    uploadList.push(pInfo.name);
                });
                actionLog = root.buildNarrativeInputText('Pink network batch store completed', [
                    `操作：传输通道 [${zoneName}] 已建立。`,
                    `上行 Upload: ${uploadList.join(', ')} >>> 云端服务器存储。`,
                    `已清空 ${filledPartyInfos.length} 个队伍槽位。`,
                    `${uploadList.join('、')} 已被传送至索妮亚研究所的云端存储系统。请简短描写多道传输光束同时闪烁、宝可梦们化为数据流消失的画面，以及 ${playerName} 的反应。`
                ]);
                mvuzPayload = { partyEdits, boxInserts };
            } else if (hasBoxPkm && emptyPartyInfos.length === pIdxs.length) {
                if (pIdxs.length !== bKeys.length) return alert(`数量不匹配：队伍空槽选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个。`);
                const partyEdits = {};
                const boxDeletes = {};
                const downloadList = [];
                bKeys.forEach((bKey, i) => {
                    const pInfo = emptyPartyInfos[i];
                    const boxObj = db.player.box[bKey];
                    const bName = boxObj?.name || 'Unknown';
                    partyEdits[pInfo.slotKey] = normalizeToPartyFormat(JSON.parse(JSON.stringify(boxObj)), pInfo.idx + 1);
                    boxDeletes[bKey] = true;
                    downloadList.push(bName);
                });
                actionLog = root.buildNarrativeInputText('Pink network batch retrieve completed', [
                    `操作：传输通道 [${zoneName}] 已建立。`,
                    `下行 Download: ${downloadList.join(', ')} <<< 云端服务器。`,
                    `已加入 ${bKeys.length} 个队伍槽位。`,
                    `${downloadList.join('、')} 已从云端传送回来！请简短描写多道传输光束同时闪烁、宝可梦们从数据流中具现化的画面，以及它们对 ${playerName} 的反应。`
                ]);
                mvuzPayload = { partyEdits, boxDeletes };
            } else if (hasBoxPkm && filledPartyInfos.length > 0) {
                if (pIdxs.length !== bKeys.length) return alert(`数量不匹配：队伍选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个。`);
                const partyEdits = {};
                const boxEdits = {};
                const uploadList = [];
                const downloadList = [];
                partyInfos.forEach((pInfo, i) => {
                    const bKey = bKeys[i];
                    const boxObj = db.player.box[bKey];
                    const bName = boxObj?.name || 'Unknown';
                    partyEdits[pInfo.slotKey] = normalizeToPartyFormat(JSON.parse(JSON.stringify(boxObj)), pInfo.idx + 1);
                    if (pInfo.name) {
                        boxEdits[bKey] = normalizeToBoxFormat(JSON.parse(JSON.stringify(pInfo.obj)));
                        uploadList.push(pInfo.name);
                    } else {
                        boxEdits[bKey] = null;
                    }
                    downloadList.push(bName);
                });
                const boxEditsFinal = {};
                const boxDeletes = {};
                Object.entries(boxEdits).forEach(([k, v]) => {
                    if (v === null) boxDeletes[k] = true;
                    else boxEditsFinal[k] = v;
                });
                const opDesc = uploadList.length > 0
                    ? `上行 (Upload): ${uploadList.join(', ')} >>> 云端服务器。\n下行 (Download): ${downloadList.join(', ')} <<< 云端服务器。`
                    : `下行 (Download): ${downloadList.join(', ')} <<< 云端服务器。`;
                actionLog = root.buildNarrativeInputText('Pink network batch transfer completed', [
                    `操作：传输通道 [${zoneName}] 已建立。`,
                    opDesc,
                    `${uploadList.length > 0 ? `${uploadList.join('、')} 与 ${downloadList.join('、')} 完成了交换传输！` : `${downloadList.join('、')} 已从云端传送回来！`}请简短描写多道光束交错的画面，宝可梦们出现后对 ${playerName} 的反应，以及 ${playerName} 与新伙伴们的互动。`
                ]);
                mvuzPayload = { partyEdits, boxEdits: boxEditsFinal, boxDeletes };
            } else {
                return alert('无效的操作组合。');
            }

            try {
                await root.postPkmAction('box.applyTransferMutation', mvuzPayload);
                await root.postTavernInput(actionLog, { source: boxInputSource });
                root.showTavernInputNotification('BOX 叙事提示已写入酒馆输入栏');
            } catch (error) {
                console.error('[BOX] 传输写入失败:', error);
                root.showPkmActionFailure(`BOX 写入失败：${error.message}`);
                return;
            }
            root.resetBoxSelection();
        };

        Object.assign(root, {
            renderBoxPage,
            generateSmartIconHex,
            renderBoxPartyCard,
            renderStorageCell,
            refreshBoxUI,
            updateOpsBar,
            normalizeToPartyFormat,
            normalizeToBoxFormat
        });
    }

    root.DashboardBoxManager = { install: installBoxManager };
})(typeof globalThis !== 'undefined' ? globalThis : window);
