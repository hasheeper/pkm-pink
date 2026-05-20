/* Shared Pokemon move pool editor. Plain global script. */
(function(root) {
    'use strict';

    function installMovePool(config = {}) {
        const product = config.product || 'dashboard';
        const getDb = config.getDb || (() => root.db);
        const actionSource = config.actionSource || `${product}:move-pool`;
        const title = config.narrativeTitle || 'Move configuration updated';
        const narrativeLine = config.narrativeLine || ((displayName) => `请简短描写 ${displayName} 调整技能、训练家确认配置的场景。`);
        const actionPayload = config.actionPayload || ((slot, slotKey, moves) => ({ slot, moves }));
        const movePoolCache = {};
        let pendingMoveChanges = {};

        async function fetchMovePool(species, currentLv) {
            if (!species) return [];
            const normalizedSpecies = species.toLowerCase().replace(/\s+/g, '-');
            const cacheKey = `${normalizedSpecies}_${currentLv}`;
            if (movePoolCache[cacheKey]) return movePoolCache[cacheKey];
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedSpecies}`);
                if (!response.ok) return [];
                const data = await response.json();
                const availableMoves = [];
                for (const moveEntry of data.moves || []) {
                    const moveName = moveEntry.move.name;
                    for (const vgd of moveEntry.version_group_details || []) {
                        if (vgd.move_learn_method.name === 'level-up' && vgd.level_learned_at <= currentLv) {
                            if (!availableMoves.find(m => m.name === moveName)) {
                                availableMoves.push({
                                    name: moveName,
                                    level: vgd.level_learned_at,
                                    displayName: root.translateMoveName(moveName.replace(/-/g, ' '))
                                });
                            }
                            break;
                        }
                    }
                }
                availableMoves.sort((a, b) => a.level - b.level);
                movePoolCache[cacheKey] = availableMoves;
                return availableMoves;
            } catch (error) {
                console.error('[MOVE_POOL] 获取技能池失败:', error);
                return [];
            }
        }

        function showMovePoolModal(slotKey, species, lv, currentMoves, movePool, isLoading) {
            const existingPanel = document.getElementById('move-pool-modal');
            if (existingPanel) existingPanel.remove();
            const displayName = root.translatePokemonNameApp(species);
            const moveKeys = ['move1', 'move2', 'move3', 'move4'];
            const currentMoveNames = moveKeys.map(k => currentMoves[k] || null);
            const currentMovesHtml = currentMoveNames.map((moveName, idx) => {
                const displayMove = moveName ? root.translateMoveName(moveName.replace(/-/g, ' ')) : '—';
                const isEmpty = !moveName;
                return `
                    <div class="mpm-current-move ${isEmpty ? 'empty' : ''}" data-slot="${idx}" data-move="${moveName || ''}">
                        <span class="mpm-move-idx">${idx + 1}</span>
                        <span class="mpm-move-name">${displayMove}</span>
                        ${!isEmpty ? `<button class="mpm-remove-btn" onclick="removeMoveFromSlot('${slotKey}', ${idx})">✕</button>` : ''}
                    </div>
                `;
            }).join('');

            let poolHtml = '';
            if (isLoading) {
                poolHtml = '<div class="mpm-loading"><span class="mpm-spinner"></span>Loading Move Pool...</div>';
            } else if (!movePool || movePool.length === 0) {
                poolHtml = '<div class="mpm-empty">No available moves found.</div>';
            } else {
                const equippedMoves = currentMoveNames.filter(Boolean).map(m => m.toLowerCase());
                const unequippedMoves = movePool.filter(m => !equippedMoves.includes(m.name.toLowerCase()));
                poolHtml = unequippedMoves.map(move => `
                    <div class="mpm-pool-move" onclick="selectMoveFromPool('${slotKey}', '${move.name}')">
                        <span class="mpm-pool-lv">Lv.${move.level}</span>
                        <span class="mpm-pool-name">${move.displayName}</span>
                    </div>
                `).join('');
                if (unequippedMoves.length === 0) {
                    poolHtml = '<div class="mpm-empty">All available moves are equipped.</div>';
                }
            }

            document.body.insertAdjacentHTML('beforeend', `
                <div id="move-pool-modal" class="mpm-overlay" onclick="closeMovePoolModal(event)">
                    <div class="mpm-container" onclick="event.stopPropagation()">
                        <div class="mpm-header">
                            <div class="mpm-title"><span class="mpm-species">${displayName}</span><span class="mpm-lv">Lv.${lv}</span></div>
                            <button class="mpm-close" onclick="closeMovePoolModal()">✕</button>
                        </div>
                        <div class="mpm-body">
                            <div class="mpm-section mpm-current"><div class="mpm-section-title">EQUIPPED MOVES</div><div class="mpm-current-list">${currentMovesHtml}</div></div>
                            <div class="mpm-section mpm-pool"><div class="mpm-section-title">AVAILABLE POOL <small>(Lv.1 ~ Lv.${lv})</small></div><div class="mpm-pool-list">${poolHtml}</div></div>
                        </div>
                        <div class="mpm-footer"><button class="mpm-save-btn" onclick="saveMoveChanges('${slotKey}')">SAVE CHANGES</button></div>
                    </div>
                </div>
            `);
        }

        function normalizeMoveName(moveName) {
            if (!moveName) return null;
            return moveName
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        async function refreshMovePoolPanel(slotKey) {
            const pkm = getDb()?.player?.party?.[slotKey];
            if (!pkm) return;
            const species = pkm.species || pkm.name;
            const currentLv = pkm.lv || 1;
            const currentMoves = pendingMoveChanges[slotKey] || pkm.moves || {};
            const movePool = await fetchMovePool(species, currentLv);
            showMovePoolModal(slotKey, species, currentLv, currentMoves, movePool, false);
        }

        function generateMoveChangeNarrative(slotKey, moves, pkm, changedMoves) {
            const species = pkm?.species || pkm?.name || 'Pokemon';
            const displayName = pkm?.nickname || root.translatePokemonNameApp(species);
            const lv = pkm?.lv || '?';
            const changedKeys = Object.keys(changedMoves || {});
            if (changedKeys.length === 0) {
                return root.buildNarrativeInputText('Move configuration unchanged', [
                    `${displayName} 的技能配置未发生变化。请只做一句轻描写，不要更新变量。`
                ]);
            }
            const changeDescriptions = changedKeys.map(key => {
                const change = changedMoves[key];
                const fromName = change.from ? root.translateMoveName(change.from.replace(/-/g, ' ')) : '空槽';
                const toName = change.to ? root.translateMoveName(change.to.replace(/-/g, ' ')) : '空槽';
                return `${fromName} → ${toName}`;
            });
            return root.buildNarrativeInputText(title, [
                `目标: ${displayName} (Lv.${lv})`,
                `技能已重组: ${changeDescriptions.join('、')}`,
                narrativeLine(displayName, pkm, changedMoves)
            ]);
        }

        function sendMoveChangeToTavern(slotKey, moves) {
            const slot = Number(String(slotKey).replace('slot', '')) || 1;
            return root.postPkmAction('party.updateMoves', actionPayload(slot, slotKey, moves));
        }

        root.openMovePoolPanel = async function openMovePoolPanel(slotKey) {
            const pkm = getDb()?.player?.party?.[slotKey];
            if (!pkm || !pkm.name) return;
            const species = pkm.species || pkm.name;
            const currentLv = pkm.lv || 1;
            const currentMoves = pkm.moves || {};
            showMovePoolModal(slotKey, species, currentLv, currentMoves, null, true);
            const movePool = await fetchMovePool(species, currentLv);
            showMovePoolModal(slotKey, species, currentLv, currentMoves, movePool, false);
        };

        root.closeMovePoolModal = function closeMovePoolModal(event) {
            if (event && event.target.id !== 'move-pool-modal') return;
            const modal = document.getElementById('move-pool-modal');
            if (modal) modal.remove();
        };

        root.selectMoveFromPool = function selectMoveFromPool(slotKey, moveName) {
            if (!pendingMoveChanges[slotKey]) {
                const pkm = getDb()?.player?.party?.[slotKey];
                pendingMoveChanges[slotKey] = { ...pkm?.moves };
            }
            const moveKeys = ['move1', 'move2', 'move3', 'move4'];
            const targetSlot = moveKeys.find(key => !pendingMoveChanges[slotKey][key]);
            if (!targetSlot) {
                root.showMovePoolNotification('All move slots are full. Remove a move first.', 'warning');
                return;
            }
            pendingMoveChanges[slotKey][targetSlot] = normalizeMoveName(moveName);
            refreshMovePoolPanel(slotKey);
        };

        root.removeMoveFromSlot = function removeMoveFromSlot(slotKey, slotIdx) {
            if (!pendingMoveChanges[slotKey]) {
                const pkm = getDb()?.player?.party?.[slotKey];
                pendingMoveChanges[slotKey] = { ...pkm?.moves };
            }
            pendingMoveChanges[slotKey][`move${slotIdx + 1}`] = null;
            refreshMovePoolPanel(slotKey);
        };

        root.saveMoveChanges = async function saveMoveChanges(slotKey) {
            const changes = pendingMoveChanges[slotKey];
            if (!changes) {
                root.closeMovePoolModal();
                return;
            }
            const pkm = getDb()?.player?.party?.[slotKey];
            const originalMoves = pkm?.moves || {};
            const changedMoves = {};
            for (const key of ['move1', 'move2', 'move3', 'move4']) {
                const oldMove = originalMoves[key] || null;
                const newMove = changes[key] || null;
                if (oldMove !== newMove) changedMoves[key] = { from: oldMove, to: newMove };
            }
            const displayName = root.translatePokemonNameApp(pkm?.species || pkm?.name || 'pokemon');
            if (Object.keys(changedMoves).length === 0) {
                delete pendingMoveChanges[slotKey];
                root.closeMovePoolModal();
                root.showMovePoolNotification(`${displayName} 技能配置未变化`, 'info');
                return;
            }
            try {
                await sendMoveChangeToTavern(slotKey, changes);
                await root.postTavernInput(generateMoveChangeNarrative(slotKey, changes, pkm, changedMoves), { source: actionSource });
            } catch (error) {
                console.error('[MOVE_POOL] 技能变更写入失败:', error);
                root.showPkmActionFailure(`技能写入失败：${error.message}`);
                return;
            }
            delete pendingMoveChanges[slotKey];
            root.closeMovePoolModal();
            root.showMovePoolNotification(`${displayName} 技能已更新！演绎提示已写入酒馆输入栏`, 'success');
        };

        root.fetchMovePool = fetchMovePool;
        root.showMovePoolModal = showMovePoolModal;
        root.normalizeMoveName = normalizeMoveName;
        root.refreshMovePoolPanel = refreshMovePoolPanel;
        root.generateMoveChangeNarrative = generateMoveChangeNarrative;
        root.sendMoveChangeToTavern = sendMoveChangeToTavern;
    }

    root.DashboardMovePool = { install: installMovePool };
})(typeof globalThis !== 'undefined' ? globalThis : window);
