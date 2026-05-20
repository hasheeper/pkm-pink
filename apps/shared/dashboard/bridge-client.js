/* Shared dashboard bridge client. Plain global script. */
(function(root) {
    'use strict';

    function installDashboardBridgeClient(config = {}) {
        const product = config.product || 'pkm';
        const defaultInputSource = config.defaultInputSource || product;
        let actionRequestSeq = 0;
        let tavernInputRequestSeq = 0;
        const pendingActionRequests = new Map();
        const pendingTavernInputRequests = new Map();

        function getTargets() {
            const targets = [];
            const addTarget = (target) => {
                if (target && !targets.includes(target) && typeof target.postMessage === 'function') {
                    targets.push(target);
                }
            };
            try { addTarget(root.parent && root.parent !== root ? root.parent : null); } catch (_) {}
            try { addTarget(root.top && root.top !== root && root.top !== root.parent ? root.top : null); } catch (_) {}
            try { addTarget(root.opener); } catch (_) {}
            if (!targets.length) addTarget(root.parent || root);
            return targets;
        }

        function formatPkmActionError(data) {
            return data?.message || data?.reason || 'PKM action failed';
        }

        function formatTavernInputError(data) {
            return data?.message || data?.reason || 'Failed to write Tavern input';
        }

        function showPkmActionFailure(message) {
            const text = message || '当前楼层写入失败，请刷新面板后重试。';
            if (typeof root.showMovePoolNotification === 'function') {
                root.showMovePoolNotification(text, 'error');
            } else {
                alert(text);
            }
        }

        function handlePkmActionResultMessage(data) {
            if (!data || (data.type !== 'PKM_ACTION_RESULT' && data.type !== 'PKM_ACTION_ERROR')) return false;
            const requestId = data.requestId || '';
            const pending = requestId ? pendingActionRequests.get(requestId) : null;
            if (!pending) return true;
            clearTimeout(pending.timer);
            pendingActionRequests.delete(requestId);
            if (data.type === 'PKM_ACTION_RESULT' && data.ok !== false) {
                pending.resolve(data);
            } else {
                const error = new Error(formatPkmActionError(data));
                error.result = data;
                pending.reject(error);
            }
            return true;
        }

        function handleTavernInputResultMessage(data) {
            if (!data || (data.type !== 'PKM_SET_TAVERN_INPUT_RESULT' && data.type !== 'PKM_SET_TAVERN_INPUT_ERROR')) return false;
            const requestId = data.requestId || '';
            const pending = requestId ? pendingTavernInputRequests.get(requestId) : null;
            if (!pending) return true;
            clearTimeout(pending.timer);
            pendingTavernInputRequests.delete(requestId);
            if (data.type === 'PKM_SET_TAVERN_INPUT_RESULT' && data.ok !== false) {
                pending.resolve(data);
            } else {
                const error = new Error(formatTavernInputError(data));
                error.result = data;
                pending.reject(error);
            }
            return true;
        }

        function postPkmAction(action, payload = {}, options = {}) {
            const requestId = options.requestId || `pkm-action-${Date.now()}-${++actionRequestSeq}`;
            const message = {
                type: 'PKM_ACTION',
                action,
                payload,
                requestId
            };
            if (options.floorKey) message.floorKey = options.floorKey;

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    pendingActionRequests.delete(requestId);
                    reject(new Error(`PKM action timed out: ${action}`));
                }, options.timeoutMs || 10000);

                pendingActionRequests.set(requestId, { resolve, reject, timer, action });

                try {
                    getTargets().forEach((target) => target.postMessage(message, '*'));
                } catch (error) {
                    clearTimeout(timer);
                    pendingActionRequests.delete(requestId);
                    reject(error);
                }
            });
        }

        function postTavernInput(text, options = {}) {
            const inputText = typeof text === 'string' ? text : '';
            if (!inputText.trim()) {
                return Promise.reject(new Error('Cannot write empty text to Tavern input'));
            }
            const requestId = options.requestId || `pkm-input-${Date.now()}-${++tavernInputRequestSeq}`;
            const message = {
                type: 'PKM_SET_TAVERN_INPUT',
                requestId,
                text: inputText,
                source: options.source || defaultInputSource
            };

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    pendingTavernInputRequests.delete(requestId);
                    reject(new Error('Writing to Tavern input timed out'));
                }, options.timeoutMs || 10000);

                pendingTavernInputRequests.set(requestId, { resolve, reject, timer });

                try {
                    getTargets().forEach((target) => target.postMessage(message, '*'));
                } catch (error) {
                    clearTimeout(timer);
                    pendingTavernInputRequests.delete(requestId);
                    reject(error);
                }
            });
        }

        root.getPkmActionTargets = getTargets;
        root.formatPkmActionError = formatPkmActionError;
        root.formatTavernInputError = formatTavernInputError;
        root.showPkmActionFailure = showPkmActionFailure;
        root.handlePkmActionResultMessage = handlePkmActionResultMessage;
        root.handleTavernInputResultMessage = handleTavernInputResultMessage;
        root.postPkmAction = postPkmAction;
        root.postTavernInput = postTavernInput;

        return {
            getTargets,
            postPkmAction,
            postTavernInput,
            handlePkmActionResultMessage,
            handleTavernInputResultMessage,
            showPkmActionFailure
        };
    }

    root.DashboardBridgeClient = { install: installDashboardBridgeClient };
})(typeof globalThis !== 'undefined' ? globalThis : window);
