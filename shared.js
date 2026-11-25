// ============================================================================
// Nawab Kurta — Shared Core Engine (Firebase Cloud Sync, Recycle Bin & Modals)
// ============================================================================
import { initializeApp, getApps, getApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { initializeFirestore, getFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 1. Inject Shared Modals (Cloud Settings, Confirm, PIN Lock, Recycle Bin)
function injectSharedModals() {
    if (document.getElementById('cloud-modal')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<!-- 7. Cloud Settings, Firebase Config & Backup Modal -->
    <div id="cloud-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <i data-lucide="cloud-cog" class="w-5 h-5 text-brand-400"></i>
                    <div>
                        <h3 id="modal-header-title" class="font-bold text-sm">Firebase Cloud Sync (/nawab_kurta)</h3>
                        <p id="modal-header-sub" class="text-[11px] text-slate-400">Project: pos-app-cf53e • Collection: /nawab_kurta/{document}</p>
                    </div>
                </div>
                <button type="button" onclick="window.closeCloudModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-5 text-sm">
                <!-- Live Cloud Connection Status Banner -->
                <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Status:</span>
                            <span id="modal-cloud-status" class="text-xs font-bold text-emerald-700">Connected: /nawab_kurta (pos-app-cf53e)</span>
                        </div>
                        <div class="text-xs text-slate-600 mt-1">
                            Collection Path: <code id="modal-uid-text" class="px-1.5 py-0.5 bg-white border border-emerald-200 rounded font-mono text-[11px] select-all">/nawab_kurta/{document}</code>
                            <span id="modal-doc-counter" class="ml-1.5 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">0 docs</span>
                        </div>
                        <div id="modal-last-ping" class="text-[11px] text-slate-500 mt-1">Real-time sync active across all devices.</div>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-shrink-0">
                        <button type="button" onclick="window.pingCloudSync()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                            <i data-lucide="activity" class="w-4 h-4"></i>
                            Test Cloud Sync (Ping)
                        </button>
                        <button type="button" onclick="window.forcePushLocalToCloud()" class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                            <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                            Force Push Local to Cloud
                        </button>
                        <button type="button" onclick="window.confirmWipeAllData()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            Wipe All Shop Data (Start Fresh)
                        </button>
                    </div>
                </div>

                <!-- Editable Shop Profile Settings (Synced to /nawab_kurta/shop_settings) -->
                <form onsubmit="window.saveShopBranding(event)" class="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/90">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Shop Profile (Synced to /nawab_kurta/shop_settings)</h4>
                        <span class="text-[11px] text-emerald-600 font-semibold">Click any field below to edit</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label for="shopNameInput" class="block text-xs font-semibold text-slate-700 mb-1">Shop / Receipt Title</label>
                            <input type="text" id="shopNameInput" autocomplete="off" spellcheck="false" placeholder="e.g. NAWAB KURTA" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs">
                        </div>
                        <div>
                            <label for="shopSubInput" class="block text-xs font-semibold text-slate-700 mb-1">Shop Address & Phone</label>
                            <input type="text" id="shopSubInput" autocomplete="off" spellcheck="false" placeholder="e.g. Shaheen Bagh, New Delhi • Ph: +91..." class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs">
                        </div>
                    </div>
                    <div>
                        <label for="shopGstInput" class="block text-xs font-semibold text-slate-700 mb-1">GSTIN / Udyam / Tax Registration Number</label>
                        <input type="text" id="shopGstInput" autocomplete="off" spellcheck="false" placeholder="e.g. GSTIN: 07AABCN1234F1Z5 or UDYAM-DL-..." class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs">
                    </div>
                    <div class="flex justify-end pt-1">
                        <button type="submit" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                            <i data-lucide="save" class="w-3.5 h-3.5"></i>
                            Save Shop Profile to /nawab_kurta
                        </button>
                    </div>
                </form>

                <!-- Editable Firebase Connection & Collection Path Settings -->
                <div class="space-y-3 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">Firebase Connection & Collection Path (Editable)</span>
                            <span class="text-[11px] text-slate-400">Customize target Firestore collection, Project ID, or Firebase Config JSON</span>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">✓ Editable</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                            <label for="cloudCollectionInput" class="block text-[11px] font-semibold text-slate-300 mb-1">Firestore Collection Name</label>
                            <input type="text" id="cloudCollectionInput" autocomplete="off" spellcheck="false" value="nawab_kurta" placeholder="nawab_kurta" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div>
                            <label for="cloudProjectIdInput" class="block text-[11px] font-semibold text-slate-300 mb-1">Firebase Project ID</label>
                            <input type="text" id="cloudProjectIdInput" autocomplete="off" spellcheck="false" value="pos-app-cf53e" placeholder="pos-app-cf53e" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                    </div>

                    <div>
                        <label for="cloudCustomConfigInput" class="block text-[11px] font-semibold text-slate-300 mb-1">Firebase Config JSON (Optional — leave as default or paste custom config)</label>
                        <textarea id="cloudCustomConfigInput" rows="3" spellcheck="false" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-[11px] font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span class="text-[11px] text-slate-400 font-mono">Rule: match /<span id="rule-col-preview">nawab_kurta</span>/{document} { allow read, write: if true; }</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="window.resetFirebaseConnectionDefaults()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition">
                                Reset Default
                            </button>
                            <button type="button" onclick="window.saveFirebaseConnectionSettings()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                                Save & Reconnect Cloud
                            </button>
                        </div>
                    </div>
                </div>

                <!-- JSON Backup & Restore Utilities -->
                <div class="space-y-2 border-t border-slate-200 pt-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Database Snapshot Backup & Restore (JSON)</h4>
                    <div class="flex flex-wrap items-center gap-2.5">
                        <button type="button" onclick="window.exportBackupJSON()" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
                            <i data-lucide="download-cloud" class="w-4 h-4 text-brand-600"></i>
                            Download Full JSON Backup
                        </button>
                        <label class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                            <i data-lucide="upload-cloud" class="w-4 h-4 text-emerald-600"></i>
                            <span>Restore from JSON File</span>
                            <input type="file" accept=".json" onchange="window.importBackupJSON(event)" class="hidden">
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 8. Custom In-App Confirmation Modal (No native window.confirm) -->
    <div id="confirm-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="alert-octagon" class="w-5 h-5"></i>
                </div>
                <div>
                    <h3 id="confirm-modal-title" class="font-bold text-slate-900 text-sm">Confirm Action</h3>
                    <p id="confirm-modal-desc" class="text-xs text-slate-500 mt-1">Are you sure you want to proceed?</p>
                </div>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onclick="window.closeConfirmModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="button" id="confirm-modal-action-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm">Confirm</button>
            </div>
        </div>
    </div>

    <!-- 10. Zero-Hint Password Modal Exclusively for Cloud Settings (#pinLockModal) -->
    <div id="pinLockModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <i data-lucide="lock" class="w-4 h-4 text-amber-400"></i>
                    <h3 class="font-bold text-sm">Enter Password</h3>
                </div>
                <button type="button" onclick="window.closePinLockModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="window.verifyDynamicPin(event)" class="p-6 space-y-4">
                <div>
                    <label for="pinLockInput" class="block text-xs font-semibold text-slate-700 mb-2 text-center">Authentication Required</label>
                    <input type="password" id="pinLockInput" inputmode="numeric" maxlength="4" required autocomplete="off" placeholder="••••" class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl font-extrabold tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white">
                    <p id="pinLockError" class="hidden text-[11px] font-semibold text-rose-600 text-center mt-2">Invalid password.</p>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onclick="window.closePinLockModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5">
                        <i data-lucide="unlock" class="w-3.5 h-3.5 text-emerald-400"></i>
                        <span>Unlock</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Recycle Bin Modal (Auto-delete after 30 days) -->
    <div id="bin-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4" onclick="window.closeBinModal()">
        <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="text-rose-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 flex-shrink-0"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></span>
                    <div>
                        <h3 class="font-bold text-sm">Recycle Bin</h3>
                        <p class="text-[11px] text-slate-400">Deleted bills, Udhaar &amp; expenses • Auto-deleted permanently after 30 days</p>
                    </div>
                </div>
                <button type="button" onclick="window.closeBinModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex flex-wrap items-center gap-1.5">
                    <button type="button" id="bin-tab-ALL" onclick="window.setBinFilter('ALL')" class="bin-tab-btn px-3 py-1.5 rounded-lg font-bold bg-slate-900 text-white transition">All</button>
                    <button type="button" id="bin-tab-sales" onclick="window.setBinFilter('sales')" class="bin-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition">Bills</button>
                    <button type="button" id="bin-tab-udhaar" onclick="window.setBinFilter('udhaar')" class="bin-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition">Udhaar</button>
                    <button type="button" id="bin-tab-expenses" onclick="window.setBinFilter('expenses')" class="bin-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition">Expenses</button>
                </div>
                <button type="button" onclick="window.confirmEmptyBin()" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold transition flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    <span>Empty Bin</span>
                </button>
            </div>

            <div id="bin-items-list" class="p-4 overflow-y-auto space-y-2.5 flex-1 min-h-[240px] bg-slate-50/40"></div>

            <div class="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span id="bin-count-summary">0 items in bin</span>
                <button type="button" onclick="window.closeBinModal()" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs">Close</button>
            </div>
        </div>
    </div>`;
    const toastEl = document.getElementById('toast-container');
    while (wrapper.firstChild) {
        if (toastEl && toastEl.parentNode) {
            toastEl.parentNode.insertBefore(wrapper.firstChild, toastEl);
        } else {
            document.body.appendChild(wrapper.firstChild);
        }
    }
}

// 2. Core State, Utilities, PIN Gate, Date Helpers & Recycle Bin
const LOCAL_CACHE_KEY = 'nawab_kurta_live_cache_v2';

        // Zero-Hint Dynamic Password Gate (Strictly for Cloud Settings)
        let pendingPinCallback = null;

        window.getDynamicPassword = () => {
            const now = new Date();
            return String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
        };

        window.requireCloudPin = (callback) => {
            pendingPinCallback = callback;
            const inpEl = document.getElementById('pinLockInput');
            const errEl = document.getElementById('pinLockError');
            const modal = document.getElementById('pinLockModal');

            if (inpEl) inpEl.value = '';
            if (errEl) errEl.classList.add('hidden');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => inpEl && inpEl.focus(), 50);
            }
            window.safeIcons();
        };

        window.closePinLockModal = () => {
            const modal = document.getElementById('pinLockModal');
            if (modal) modal.classList.add('hidden');
            pendingPinCallback = null;
        };

        window.verifyDynamicPin = (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const inpEl = document.getElementById('pinLockInput');
            const errEl = document.getElementById('pinLockError');
            const entered = (inpEl?.value || '').trim();
            const expected = window.getDynamicPassword();

            if (entered === expected) {
                const cb = pendingPinCallback;
                window.closePinLockModal();
                if (typeof cb === 'function') cb();
            } else {
                if (errEl) errEl.classList.remove('hidden');
                if (inpEl) {
                    inpEl.value = '';
                    inpEl.focus();
                }
                window.showToast('Invalid password', 'error');
            }
        };

        // Local Date Helpers (IST-safe YYYY-MM-DD storage + DD/MM/YYYY display across full app)
        window.getLocalTodayYMD = () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        window.formatDisplayDate = (dateStr, timestamp = null) => {
            if (typeof dateStr === 'string' && dateStr.trim()) {
                const s = dateStr.trim();
                const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
                const dmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                if (dmyMatch) return `${dmyMatch[1]}/${dmyMatch[2]}/${dmyMatch[3]}`;
                return s;
            }
            if (timestamp) {
                const d = new Date(Number(timestamp));
                if (!isNaN(d.getTime())) {
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                }
            }
            return '';
        };

        // Shared Date Filter Helper (Used across Sales, Expenses, and Udhaar)
        window.matchesDateRange = (dateStr, timestamp, filterType, customFrom, customTo) => {
            if (!filterType || filterType === 'ALL') return true;

            const toLocalYMD = (d) => {
                const yr = d.getFullYear();
                const mo = String(d.getMonth() + 1).padStart(2, '0');
                const da = String(d.getDate()).padStart(2, '0');
                return `${yr}-${mo}-${da}`;
            };

            let recordYMD = '';
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
                recordYMD = dateStr.slice(0, 10);
            } else if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
                recordYMD = `${dateStr.slice(6, 10)}-${dateStr.slice(3, 5)}-${dateStr.slice(0, 2)}`;
            } else if (timestamp) {
                recordYMD = toLocalYMD(new Date(Number(timestamp)));
            } else {
                return true;
            }

            const now = new Date();
            const todayYMD = toLocalYMD(now);

            if (filterType === 'TODAY') {
                return recordYMD === todayYMD;
            }
            if (filterType === 'YESTERDAY') {
                const yest = new Date(now);
                yest.setDate(now.getDate() - 1);
                return recordYMD === toLocalYMD(yest);
            }
            if (filterType === 'LAST_7') {
                const sevenAgo = new Date(now);
                sevenAgo.setDate(now.getDate() - 6);
                const startYMD = toLocalYMD(sevenAgo);
                return recordYMD >= startYMD && recordYMD <= todayYMD;
            }
            if (filterType === 'THIS_MONTH') {
                const thisMonthPrefix = todayYMD.slice(0, 7);
                return recordYMD.startsWith(thisMonthPrefix);
            }
            if (filterType === 'LAST_MONTH') {
                const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
                return recordYMD.startsWith(lastMonthPrefix);
            }
            if (filterType === 'CUSTOM') {
                if (customFrom && recordYMD < customFrom) return false;
                if (customTo && recordYMD > customTo) return false;
                return true;
            }
            return true;
        };

window.state = {
            sales: [],
            expenses: [],
            udhaar: [],
            bin: [],
            cart: [],
            exchangeMode: false,
            exchangeRefSaleId: '',
            exchangeRefInvoiceNo: '',
            exchangeItems: [],
            editingSaleItems: [],
            posPaymentMode: 'Cash',
            isCloudConnected: false,
            totalCloudDocs: 0,
            shopName: 'NAWAB KURTA',
            shopSub: 'Shaheen Bagh, New Delhi • Ph: +91 98765 43210',
            shopGst: 'GSTIN: 07AABCN1234F1Z5',
            activeReceiptSale: null
        };

        window.loadLocalCache = () => {
            try {
                const raw = localStorage.getItem(LOCAL_CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    window.state.sales = Array.isArray(parsed.sales) ? parsed.sales : [];
                    window.state.expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
                    window.state.udhaar = Array.isArray(parsed.udhaar) ? parsed.udhaar : [];
                    window.state.bin = Array.isArray(parsed.bin) ? parsed.bin : [];
                    if (parsed.shopName) window.state.shopName = parsed.shopName;
                    if (parsed.shopSub) window.state.shopSub = parsed.shopSub;
                    if (parsed.shopGst) window.state.shopGst = parsed.shopGst;
                }
            } catch (e) {
                console.warn('Cache parse warning:', e);
            }
        }

        window.saveLocalCache = () => {
            try {
                localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
                    sales: window.state.sales,
                    expenses: window.state.expenses,
                    udhaar: window.state.udhaar,
                    bin: window.state.bin,
                    shopName: window.state.shopName,
                    shopSub: window.state.shopSub,
                    shopGst: window.state.shopGst
                }));
            } catch (e) {}
        }

        window.escapeHTML = (str) => String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        window.formatINR = (amount) => {
            const num = Number(amount) || 0;
            return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
        };

        window.formatPaymentLabel = (mode, cashAmt, onlineAmt, remAmt) => {
            if (mode === 'Split') {
                return `Split (Cash: ${window.formatINR(cashAmt || 0)} + Online: ${window.formatINR(onlineAmt || 0)})`;
            }
            if (mode === 'Advance') {
                const advTotal = (Number(cashAmt) || 0) + (Number(onlineAmt) || 0);
                const parts = [];
                if (Number(cashAmt) > 0) parts.push(`Cash: ${window.formatINR(cashAmt)}`);
                if (Number(onlineAmt) > 0) parts.push(`Online: ${window.formatINR(onlineAmt)}`);
                const partStr = parts.length > 0 ? ` [${parts.join(' + ')}]` : '';
                return `Advance: ${window.formatINR(advTotal)}${partStr} • Due: ${window.formatINR(remAmt || 0)}`;
            }
            return mode || 'Cash';
        };

        window.safeIcons = () => {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        };

        window.showToast = (message, type = 'success') => {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            const bgClass = type === 'error' ? 'bg-rose-600 text-white' : type === 'warning' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white';
            toast.className = `${bgClass} px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300`;
            toast.innerHTML = `<span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 2800);
        };

        // Custom In-App Confirmation Dialog
        let pendingConfirmCallback = null;
        window.openConfirmModal = (title, desc, onConfirm) => {
            document.getElementById('confirm-modal-title').textContent = title;
            document.getElementById('confirm-modal-desc').textContent = desc;
            pendingConfirmCallback = onConfirm;
            const btn = document.getElementById('confirm-modal-action-btn');
            btn.onclick = async () => {
                const cb = pendingConfirmCallback;
                window.closeConfirmModal();
                if (cb) await cb();
            };
            document.getElementById('confirm-modal').classList.remove('hidden');
            window.safeIcons();
        };

        window.closeConfirmModal = () => {
            document.getElementById('confirm-modal').classList.add('hidden');
            pendingConfirmCallback = null;
        };

        // Optimistic Local + Cloud Persistence Bridge
        const DOC_TYPE_MAP = {
            sales: 'sale',
            expenses: 'expense',
            udhaar: 'udhaar'
        };

        window.saveDocument = async (stateKey, docObj) => {
            const docType = DOC_TYPE_MAP[stateKey] || stateKey;
            const payload = {
                ...docObj,
                docType,
                recordType: docType,
                updatedAt: new Date().toISOString()
            };

            const list = window.state[stateKey];
            const idx = list.findIndex(item => item.id === payload.id);
            if (idx >= 0) list[idx] = payload;
            else list.unshift(payload);

            window.saveLocalCache();
            window.refreshAllViews();

            if (window.cloudWriteDoc) {
                await window.cloudWriteDoc(payload.id, payload);
            }
        };

        window.removeDocument = async (stateKey, id, permanent = false) => {
            const existing = (window.state[stateKey] || []).find(item => item.id === id);
            window.state[stateKey] = (window.state[stateKey] || []).filter(item => item.id !== id);

            if (!permanent && existing && ['sales', 'expenses', 'udhaar'].includes(stateKey)) {
                const binDoc = {
                    ...existing,
                    originalType: stateKey,
                    docType: 'bin',
                    recordType: 'bin',
                    deletedAt: Date.now(),
                    updatedAt: new Date().toISOString()
                };
                window.state.bin = [binDoc, ...(window.state.bin || []).filter(b => b.id !== id)];
                window.saveLocalCache();
                window.refreshAllViews();
                if (window.cloudWriteDoc) {
                    await window.cloudWriteDoc(binDoc.id, binDoc);
                }
                return;
            }

            window.saveLocalCache();
            window.refreshAllViews();

            if (window.cloudRemoveDoc) {
                await window.cloudRemoveDoc(id);
            }
        };

        // Recycle Bin Engine (30-Day Auto-Delete + Restore + Permanent Delete)
        const BIN_RETENTION_DAYS = 30;
        const BIN_RETENTION_MS = BIN_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        let currentBinFilter = 'ALL';

        window.purgeExpiredBinItems = async () => {
            if (!Array.isArray(window.state.bin) || window.state.bin.length === 0) return;
            const now = Date.now();
            const expired = window.state.bin.filter(item => {
                const delTs = Number(item.deletedAt) || 0;
                return delTs > 0 && (now - delTs) >= BIN_RETENTION_MS;
            });
            if (expired.length === 0) return;

            const expiredIds = new Set(expired.map(i => i.id));
            window.state.bin = window.state.bin.filter(i => !expiredIds.has(i.id));
            window.saveLocalCache();
            for (const item of expired) {
                if (window.cloudRemoveDoc) {
                    try { await window.cloudRemoveDoc(item.id); } catch (e) {}
                }
            }
            window.updateBinBadges();
        };

        window.updateBinBadges = () => {
            const count = Array.isArray(window.state.bin) ? window.state.bin.length : 0;
            const sbBin = document.getElementById('sidebar-bin-badge');
            const hdrBin = document.getElementById('header-bin-badge');
            if (sbBin) {
                sbBin.textContent = count;
                sbBin.classList.toggle('hidden', count === 0);
            }
            if (hdrBin) {
                hdrBin.textContent = count;
                hdrBin.classList.toggle('hidden', count === 0);
            }
        };

        window.openBinModal = async () => {
            await window.purgeExpiredBinItems();
            window.renderBinList();
            document.getElementById('bin-modal')?.classList.remove('hidden');
            window.safeIcons();
        };

        window.closeBinModal = () => {
            document.getElementById('bin-modal')?.classList.add('hidden');
        };

        window.setBinFilter = (filter) => {
            currentBinFilter = filter;
            document.querySelectorAll('.bin-tab-btn').forEach(btn => {
                btn.className = 'bin-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition';
            });
            const active = document.getElementById('bin-tab-' + filter);
            if (active) {
                active.className = 'bin-tab-btn px-3 py-1.5 rounded-lg font-bold bg-slate-900 text-white transition';
            }
            window.renderBinList();
        };

        window.renderBinList = () => {
            const container = document.getElementById('bin-items-list');
            const summaryEl = document.getElementById('bin-count-summary');
            if (!container) return;

            const allBin = Array.isArray(window.state.bin) ? window.state.bin : [];
            const filtered = currentBinFilter === 'ALL'
                ? allBin
                : allBin.filter(i => i.originalType === currentBinFilter);

            if (summaryEl) {
                summaryEl.textContent = `${filtered.length} of ${allBin.length} deleted item(s) • Auto-deletes after 30 days`;
            }

            if (filtered.length === 0) {
                container.innerHTML = `<div class="py-12 text-center text-slate-400 text-xs">Recycle Bin is empty. Deleted bills, Udhaar &amp; expenses appear here for 30 days.</div>`;
                return;
            }

            const now = Date.now();
            container.innerHTML = filtered.map(item => {
                const origType = item.originalType || 'sales';
                const badgeMap = {
                    sales: { label: 'Bill / Invoice', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                    udhaar: { label: 'Udhaar', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
                    expenses: { label: 'Expense', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
                };
                const badge = badgeMap[origType] || badgeMap.sales;

                const title = origType === 'sales'
                    ? `${item.invoiceNo || 'Invoice'} — ${item.customerName || 'Walk-in'}`
                    : origType === 'udhaar'
                    ? `${item.partyName || 'Party'} (${item.type || 'Udhaar'})`
                    : `${item.title || 'Expense'} (${item.category || ''})`;

                const amount = origType === 'sales' ? (item.grandTotal || 0) : (item.amount || 0);
                const delTs = Number(item.deletedAt) || now;
                const daysLeft = Math.max(0, Math.ceil((BIN_RETENTION_MS - (now - delTs)) / (24 * 60 * 60 * 1000)));
                const delDateStr = window.formatDisplayDate('', delTs);
                const origDateStr = window.formatDisplayDate(item.dateStr, item.timestamp);

                return `
                    <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="min-w-0 flex-1 space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}">${badge.label}</span>
                                <span class="text-xs font-bold text-slate-900 truncate">${window.escapeHTML(title)}</span>
                            </div>
                            <div class="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span class="font-bold text-slate-800">${formatINR(amount)}</span>
                                ${origDateStr ? `<span>Date: ${origDateStr}</span>` : ''}
                                <span>Deleted: ${delDateStr}</span>
                                <span class="text-rose-600 font-semibold">${daysLeft === 0 ? 'Deletes today' : daysLeft + ' days left'}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" onclick="window.restoreFromBin('${item.id}')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition">
                                Restore
                            </button>
                            <button type="button" onclick="window.permanentDeleteFromBin('${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition">
                                Delete Forever
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        };

        window.restoreFromBin = async (id) => {
            const item = (window.state.bin || []).find(b => b.id === id);
            if (!item) return;
            const targetKey = item.originalType || 'sales';
            window.state.bin = window.state.bin.filter(b => b.id !== id);

            const restored = { ...item };
            delete restored.deletedAt;
            delete restored.originalType;
            await window.saveDocument(targetKey, restored);
            window.renderBinList();
            window.showToast('Restored from Recycle Bin!');
        };

        window.permanentDeleteFromBin = (id) => {
            window.openConfirmModal(
                'Delete Permanently?',
                'This item will be permanently erased from both local storage and Firebase Cloud. This cannot be undone.',
                async () => {
                    window.state.bin = (window.state.bin || []).filter(b => b.id !== id);
                    window.saveLocalCache();
                    window.updateBinBadges();
                    window.renderBinList();
                    if (window.cloudRemoveDoc) {
                        await window.cloudRemoveDoc(id);
                    }
                    window.showToast('Permanently deleted!');
                }
            );
        };

        window.confirmEmptyBin = () => {
            if (!window.state.bin || window.state.bin.length === 0) {
                window.showToast('Recycle Bin is already empty', 'warning');
                return;
            }
            window.openConfirmModal(
                'Empty Recycle Bin?',
                `Permanently delete all ${window.state.bin.length} item(s) in the Recycle Bin? This cannot be undone.`,
                async () => {
                    const toErase = [...window.state.bin];
                    window.state.bin = [];
                    window.saveLocalCache();
                    window.updateBinBadges();
                    window.renderBinList();
                    for (const it of toErase) {
                        if (window.cloudRemoveDoc) {
                            await window.cloudRemoveDoc(it.id);
                        }
                    }
                    window.showToast('Recycle Bin emptied!');
                }
            );
        };



        window.applyBrandingToDOM = (forcePopulateInputs = false) => {
            const { shopName, shopSub, shopGst } = window.state;
            const titleEl = document.getElementById('rcpt-shop-title');
            const subEl = document.getElementById('rcpt-shop-sub');
            const gstEl = document.getElementById('rcpt-shop-gst');
            const sidebarEl = document.getElementById('sidebar-shop-name');

            if (titleEl) titleEl.textContent = shopName;
            if (subEl) subEl.textContent = shopSub;
            if (gstEl) gstEl.textContent = shopGst;
            if (sidebarEl) sidebarEl.textContent = shopName.split(' ').slice(0, 2).join(' ');

            if (forcePopulateInputs) {
                const nameInp = document.getElementById('shopNameInput');
                const subInp = document.getElementById('shopSubInput');
                const gstInp = document.getElementById('shopGstInput');

                if (nameInp && document.activeElement !== nameInp) nameInp.value = shopName;
                if (subInp && document.activeElement !== subInp) subInp.value = shopSub;
                if (gstInp && document.activeElement !== gstInp) gstInp.value = shopGst;
            }
        };

        window.updateGlobalSidebarBadges = () => {
            if (typeof window.updateBinBadges === 'function') window.updateBinBadges();
            const { udhaar } = window.state;
            const pendingUdhaar = (udhaar || [])
                .filter(u => u.status === 'Pending' && u.type === 'Customer Receivable')
                .reduce((sum, u) => sum + (Number(u.amount) || 0), 0);

            const sbUdh = document.getElementById('sidebar-udhaar-badge');
            if (sbUdh) {
                if (pendingUdhaar > 0) sbUdh.classList.remove('hidden');
                else sbUdh.classList.add('hidden');
            }
        };

        window.refreshAllViews = () => {
            window.updateGlobalSidebarBadges();
            if (typeof window.onPageRefresh === 'function') {
                window.onPageRefresh();
            }
            window.safeIcons();
        };

// 7. Cloud Modal (Password Protected), Branding, Backup & Wipe Handlers
        window.openCloudModal = () => {
            window.requireCloudPin(() => {
                window.applyBrandingToDOM(true);
                if (window.populateFirebaseModalInputs) {
                    window.populateFirebaseModalInputs();
                }
                document.getElementById('cloud-modal').classList.remove('hidden');
                window.safeIcons();
            });
        };

        window.closeCloudModal = () => {
            document.getElementById('cloud-modal').classList.add('hidden');
        };

        window.saveShopBranding = async (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const nameEl = document.getElementById('shopNameInput');
            const subEl = document.getElementById('shopSubInput');
            const gstEl = document.getElementById('shopGstInput');

            const name = (nameEl?.value || '').trim() || 'NAWAB KURTA';
            const sub = (subEl?.value || '').trim() || 'Shaheen Bagh, New Delhi • Ph: +91 98765 43210';
            const gst = (gstEl?.value || '').trim() || 'GSTIN: 07AABCN1234F1Z5';

            window.state.shopName = name;
            window.state.shopSub = sub;
            window.state.shopGst = gst;
            window.saveLocalCache();
            window.applyBrandingToDOM(true);

            if (window.cloudWriteDoc) {
                await window.cloudWriteDoc('shop_settings', {
                    id: 'shop_settings',
                    docType: 'settings',
                    shopName: name,
                    shopSub: sub,
                    shopGst: gst,
                    updatedAt: new Date().toISOString()
                });
                window.showToast(`Shop profile saved & synced to /${window.getActiveCollectionName ? window.getActiveCollectionName() : 'nawab_kurta'}/shop_settings!`);
            } else {
                window.showToast('Shop profile saved locally!');
            }
        };

        window.confirmWipeAllData = () => {
            window.openConfirmModal(
                'Wipe All Shop Data & Start Fresh?',
                'This will permanently delete all sales invoices, expenses, and Udhaar entries from both /nawab_kurta in Firebase Cloud and local storage.',
                async () => {
                    if (window.executeCloudAndLocalWipe) {
                        await window.executeCloudAndLocalWipe(true);
                    } else {
                        window.state.sales = [];
                        window.state.expenses = [];
                        window.state.udhaar = [];
                        window.state.cart = [];
                        localStorage.removeItem(LOCAL_CACHE_KEY);
                        window.refreshAllViews();
                        window.showToast('All local shop data wiped clean!');
                    }
                }
            );
        };

        window.exportBackupJSON = () => {
            const payload = {
                exportedAt: new Date().toISOString(),
                shopName: window.state.shopName,
                shopSub: window.state.shopSub,
                shopGst: window.state.shopGst,
                sales: window.state.sales,
                expenses: window.state.expenses,
                udhaar: window.state.udhaar,
                bin: window.state.bin
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NawabKurta_CloudBackup_${window.getLocalTodayYMD()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            window.showToast('Full JSON Backup downloaded!');
        };

        window.importBackupJSON = async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (Array.isArray(data.sales)) {
                    for (const s of data.sales) await window.saveDocument('sales', s);
                }
                if (Array.isArray(data.expenses)) {
                    for (const e of data.expenses) await window.saveDocument('expenses', e);
                }
                if (Array.isArray(data.udhaar)) {
                    for (const u of data.udhaar) await window.saveDocument('udhaar', u);
                }
                if (Array.isArray(data.bin) && data.bin.length > 0) {
                    const existingIds = new Set((window.state.bin || []).map(b => b.id));
                    for (const b of data.bin) {
                        if (!b || !b.id) continue;
                        const binDoc = { ...b, docType: 'bin', recordType: 'bin' };
                        if (!existingIds.has(binDoc.id)) {
                            window.state.bin.push(binDoc);
                            existingIds.add(binDoc.id);
                        }
                        if (window.cloudWriteDoc) {
                            await window.cloudWriteDoc(binDoc.id, binDoc);
                        }
                    }
                    window.saveLocalCache();
                }
                if (data.shopName || data.shopSub || data.shopGst) {
                    if (data.shopName) window.state.shopName = data.shopName;
                    if (data.shopSub) window.state.shopSub = data.shopSub;
                    if (data.shopGst) window.state.shopGst = data.shopGst;
                    window.saveLocalCache();
                    window.applyBrandingToDOM(true);
                    if (window.cloudWriteDoc) {
                        await window.cloudWriteDoc('shop_settings', {
                            id: 'shop_settings',
                            docType: 'settings',
                            shopName: window.state.shopName,
                            shopSub: window.state.shopSub,
                            shopGst: window.state.shopGst,
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
                window.refreshAllViews();
                window.showToast('Backup restored and synced to /nawab_kurta!');
                window.closeCloudModal();
            } catch (err) {
                window.showToast('Failed to parse backup JSON file', 'error');
            }
        };

// 3. Firebase Cloud Sync Engine (/nawab_kurta)
        const DEFAULT_FIREBASE_CONFIG = {
            apiKey: "AIzaSyCU9P4z-hBu7sho7tT55GkLBANsd2Ghs-w",
            authDomain: "pos-app-cf53e.firebaseapp.com",
            projectId: "pos-app-cf53e",
            storageBucket: "pos-app-cf53e.firebasestorage.app",
            messagingSenderId: "956442371301",
            appId: "1:956442371301:web:dc80cf534f0e2f81c3600c",
            measurementId: "G-7ZMK6Q919Q"
        };

        const CUSTOM_CONN_KEY = 'nk_custom_firebase_conn_v1';
        
        const PENDING_DELETES_KEY = 'nk_pending_cloud_deletes_v1';

        let activeCollectionName = 'nawab_kurta';
        let activeFirebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };
        let currentInitializedProjectId = null;
        let db = null;
        let unsubscribeSnapshot = null;

        function getPendingDeletes() {
            try {
                const raw = localStorage.getItem(PENDING_DELETES_KEY);
                return raw ? new Set(JSON.parse(raw)) : new Set();
            } catch (e) {
                return new Set();
            }
        }

        function savePendingDeletes(setObj) {
            try {
                localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(Array.from(setObj)));
            } catch (e) {}
        }

        function loadCustomConnectionSettings() {
            try {
                const raw = localStorage.getItem(CUSTOM_CONN_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.collectionName) activeCollectionName = parsed.collectionName.replace(/^\/+|\/+$/g, '');
                    if (parsed.firebaseConfig && parsed.firebaseConfig.projectId) {
                        activeFirebaseConfig = { ...DEFAULT_FIREBASE_CONFIG, ...parsed.firebaseConfig };
                    }
                }
            } catch (e) {
                console.warn('Custom connection parse warning:', e);
            }
        }
        loadCustomConnectionSettings();

        window.getActiveCollectionName = () => activeCollectionName;

        window.populateFirebaseModalInputs = () => {
            const colInp = document.getElementById('cloudCollectionInput');
            const projInp = document.getElementById('cloudProjectIdInput');
            const cfgInp = document.getElementById('cloudCustomConfigInput');
            const rulePreview = document.getElementById('rule-col-preview');

            if (colInp && document.activeElement !== colInp) colInp.value = activeCollectionName;
            if (projInp && document.activeElement !== projInp) projInp.value = activeFirebaseConfig.projectId || 'pos-app-cf53e';
            if (cfgInp && document.activeElement !== cfgInp) cfgInp.value = JSON.stringify(activeFirebaseConfig, null, 2);
            if (rulePreview) rulePreview.textContent = activeCollectionName;
        };

        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'cloudCollectionInput') {
                const cleanCol = (e.target.value || 'nawab_kurta').trim().replace(/^\/+|\/+$/g, '') || 'nawab_kurta';
                const rulePreview = document.getElementById('rule-col-preview');
                if (rulePreview) rulePreview.textContent = cleanCol;
            }
        });

        window.saveFirebaseConnectionSettings = async () => {
            const colInp = document.getElementById('cloudCollectionInput');
            const projInp = document.getElementById('cloudProjectIdInput');
            const cfgInp = document.getElementById('cloudCustomConfigInput');

            const newCol = (colInp?.value || 'nawab_kurta').trim().replace(/^\/+|\/+$/g, '') || 'nawab_kurta';
            const newProj = (projInp?.value || 'pos-app-cf53e').trim() || 'pos-app-cf53e';
            let newCfg = { ...activeFirebaseConfig, projectId: newProj };

            if (cfgInp && cfgInp.value.trim()) {
                try {
                    const parsedCfg = JSON.parse(cfgInp.value.trim());
                    if (parsedCfg && typeof parsedCfg === 'object') {
                        newCfg = { ...DEFAULT_FIREBASE_CONFIG, ...parsedCfg, projectId: newProj || parsedCfg.projectId };
                    }
                } catch (e) {
                    window.showToast('Invalid JSON in Firebase Config box — using Project ID & Collection Name', 'warning');
                }
            }

            const projectChanged = (newCfg.projectId !== currentInitializedProjectId);
            activeCollectionName = newCol;
            activeFirebaseConfig = newCfg;

            localStorage.setItem(CUSTOM_CONN_KEY, JSON.stringify({
                collectionName: activeCollectionName,
                firebaseConfig: activeFirebaseConfig
            }));

            window.populateFirebaseModalInputs();
            await bootFirebase(projectChanged);
            window.showToast(`Connected to /${activeCollectionName} (${activeFirebaseConfig.projectId})!`);
        };

        window.resetFirebaseConnectionDefaults = async () => {
            localStorage.removeItem(CUSTOM_CONN_KEY);
            const projectChanged = (DEFAULT_FIREBASE_CONFIG.projectId !== currentInitializedProjectId);
            activeCollectionName = 'nawab_kurta';
            activeFirebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };
            window.populateFirebaseModalInputs();
            await bootFirebase(projectChanged);
            window.showToast('Restored default /nawab_kurta (pos-app-cf53e) settings!');
        };

        function updateSyncBadge(status, subText = '') {
            const badge = document.getElementById('sync-badge');
            const uidEl = document.getElementById('user-id-display');
            const headerPill = document.getElementById('header-cloud-pill');
            const headerDot = document.getElementById('header-cloud-dot');
            const headerText = document.getElementById('header-cloud-text');
            const modalStatus = document.getElementById('modal-cloud-status');
            const modalDocCounter = document.getElementById('modal-doc-counter');
            const modalUidText = document.getElementById('modal-uid-text');
            const modalHeaderTitle = document.getElementById('modal-header-title');
            const modalHeaderSub = document.getElementById('modal-header-sub');

            const count = window.state.totalCloudDocs || 0;
            const projId = activeFirebaseConfig.projectId || 'pos-app-cf53e';

            if (modalUidText) modalUidText.textContent = `/${activeCollectionName}/{document}`;
            if (modalHeaderTitle) modalHeaderTitle.textContent = `Firebase Cloud Sync (/${activeCollectionName})`;
            if (modalHeaderSub) modalHeaderSub.textContent = `Project: ${projId} • Collection: /${activeCollectionName}/{document}`;

            if (status === 'CONNECTED') {
                if (badge) {
                    badge.className = 'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400';
                    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> /${activeCollectionName} (${count})`;
                }
                if (uidEl) uidEl.textContent = `Connected: /${activeCollectionName} (${projId}) • ${count} docs`;
                if (headerPill) headerPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer';
                if (headerDot) headerDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500';
                if (headerText) headerText.textContent = `Connected: /${activeCollectionName} (${projId})`;
                if (modalStatus) {
                    modalStatus.textContent = `Connected: /${activeCollectionName} (${projId})`;
                    modalStatus.className = 'text-xs font-bold text-emerald-700';
                }
                if (modalDocCounter) modalDocCounter.textContent = `${count} docs`;
            } else if (status === 'SYNCING') {
                if (headerPill) headerPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer';
                if (headerDot) headerDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse';
                if (headerText) headerText.textContent = subText || `Syncing /${activeCollectionName}...`;
            } else {
                if (badge) {
                    badge.className = 'inline-flex items-center gap-1.5 text-xs font-medium text-rose-400';
                    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> Offline Mode`;
                }
                if (headerPill) headerPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer';
                if (headerDot) headerDot.className = 'w-1.5 h-1.5 rounded-full bg-rose-500';
                if (headerText) headerText.textContent = subText ? `Sync Error (${subText.slice(0, 24)})` : 'Offline (Local Ready)';
                if (modalStatus) {
                    modalStatus.textContent = `Offline / Error: ${subText || 'Check Connection or Firestore Rules'}`;
                    modalStatus.className = 'text-xs font-bold text-rose-600';
                }
            }
        }

        // Write document to Firestore with explicit error notification & pending-delete cleanup
        window.cloudWriteDoc = async (docId, payload) => {
            const strId = String(docId);
            const pendingDeletes = getPendingDeletes();
            if (pendingDeletes.has(strId)) {
                pendingDeletes.delete(strId);
                savePendingDeletes(pendingDeletes);
            }
            if (!db) {
                window.showToast('Saved locally (Offline Mode — will auto-sync when online)', 'warning');
                return false;
            }
            try {
                await setDoc(doc(db, activeCollectionName, strId), payload);
                return true;
            } catch (err) {
                console.warn('Firestore write error:', err);
                updateSyncBadge('ERROR', err.code || err.message);
                window.showToast(`Cloud sync error (${err.code || 'check rules'}): Saved in local cache`, 'error');
                return false;
            }
        };

        // Remove document from Firestore with offline queue tracking so deleted items never resurrect
        window.cloudRemoveDoc = async (docId) => {
            const strId = String(docId);
            const pendingDeletes = getPendingDeletes();
            pendingDeletes.add(strId);
            savePendingDeletes(pendingDeletes);

            if (!db) return false;
            try {
                await deleteDoc(doc(db, activeCollectionName, strId));
                const updated = getPendingDeletes();
                updated.delete(strId);
                savePendingDeletes(updated);
                return true;
            } catch (err) {
                console.warn('Firestore delete error:', err);
                updateSyncBadge('ERROR', err.code || err.message);
                window.showToast(`Cloud delete error (${err.code || 'check rules'}): Queued for deletion`, 'error');
                return false;
            }
        };

        // Batch helper (commits up to 450 docs per Firestore writeBatch atomically)
        async function commitBatchRecords(recordsWithIds) {
            if (!db || recordsWithIds.length === 0) return 0;
            const CHUNK_SIZE = 450;
            let totalCommitted = 0;
            for (let i = 0; i < recordsWithIds.length; i += CHUNK_SIZE) {
                const chunk = recordsWithIds.slice(i, i + CHUNK_SIZE);
                const batch = writeBatch(db);
                chunk.forEach(({ id, data, merge }) => {
                    const ref = doc(db, activeCollectionName, String(id));
                    if (merge) batch.set(ref, data, { merge: true });
                    else batch.set(ref, data);
                });
                await batch.commit();
                totalCommitted += chunk.length;
            }
            return totalCommitted;
        }

        window.forcePushLocalToCloud = async () => {
            if (!db) {
                window.showToast('Firestore not connected yet', 'error');
                return;
            }
            try {
                const batchItems = [];
                window.state.sales.forEach(s => {
                    batchItems.push({ id: s.id, data: { ...s, docType: 'sale', recordType: 'sale' } });
                });
                window.state.expenses.forEach(e => {
                    batchItems.push({ id: e.id, data: { ...e, docType: 'expense', recordType: 'expense' } });
                });
                window.state.udhaar.forEach(u => {
                    batchItems.push({ id: u.id, data: { ...u, docType: 'udhaar', recordType: 'udhaar' } });
                });
                (window.state.bin || []).forEach(b => {
                    batchItems.push({ id: b.id, data: { ...b, docType: 'bin', recordType: 'bin' } });
                });
                batchItems.push({
                    id: 'shop_settings',
                    data: {
                        id: 'shop_settings',
                        docType: 'settings',
                        shopName: window.state.shopName,
                        shopSub: window.state.shopSub,
                        shopGst: window.state.shopGst,
                        updatedAt: new Date().toISOString()
                    },
                    merge: true
                });

                const pushedCount = await commitBatchRecords(batchItems);
                window.showToast(`Atomically pushed ${pushedCount - 1} records + Shop Profile to /${activeCollectionName}!`);
            } catch (err) {
                updateSyncBadge('ERROR', err.code || err.message);
                window.showToast(`Push failed: ${err.message}`, 'error');
            }
        };

        window.pingCloudSync = async () => {
            if (!db) {
                window.showToast('Firestore not connected yet', 'error');
                return;
            }
            try {
                const nowIso = new Date().toISOString();
                await setDoc(doc(db, activeCollectionName, 'shop_settings'), {
                    id: 'shop_settings',
                    docType: 'settings',
                    shopName: window.state.shopName,
                    shopSub: window.state.shopSub,
                    shopGst: window.state.shopGst,
                    lastPingAt: nowIso,
                    updatedAt: nowIso
                }, { merge: true });
                const pingEl = document.getElementById('modal-last-ping');
                if (pingEl) pingEl.textContent = `Last Cloud Ping Verified: ${new Date(nowIso).toLocaleTimeString()}`;
                updateSyncBadge('CONNECTED');
                window.showToast(`Cloud Ping verified on /${activeCollectionName}!`);
            } catch (err) {
                updateSyncBadge('ERROR', err.code || err.message);
                window.showToast(`Ping Failed: ${err.message}`, 'error');
            }
        };

        window.executeCloudAndLocalWipe = async (notify = true) => {
            window.state.sales = [];
            window.state.expenses = [];
            window.state.udhaar = [];
            window.state.bin = [];
            window.state.cart = [];
            localStorage.removeItem(LOCAL_CACHE_KEY);
            localStorage.removeItem(PENDING_DELETES_KEY);
            window.refreshAllViews();

            if (db) {
                try {
                    const snap = await getDocs(collection(db, activeCollectionName));
                    const docsToDelete = snap.docs.map(d => d.id);
                    const CHUNK_SIZE = 450;
                    for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
                        const batch = writeBatch(db);
                        docsToDelete.slice(i, i + CHUNK_SIZE).forEach(docId => {
                            batch.delete(doc(db, activeCollectionName, docId));
                        });
                        await batch.commit();
                    }
                } catch (err) {
                    console.warn('Cloud wipe warning:', err);
                    window.showToast(`Cloud wipe warning: ${err.message}`, 'warning');
                }
            }
            if (notify) {
                window.closeCloudModal();
                window.showToast('All previous shop data wiped! Starting 100% fresh.');
            }
        };

        // Smart Bi-Directional Merge Helper: Preserves newer/offline local records & pushes them to Cloud
        function mergeCloudAndLocalList(cloudList, localList, pendingDeletes, normalizeFn = null, docTypeTag = '') {
            const mergedMap = new Map();
            const unsyncedToPush = [];

            const getRecordTime = (r) => {
                if (!r) return 0;
                if (r.updatedAt) {
                    const t = Date.parse(r.updatedAt);
                    if (!isNaN(t)) return t;
                }
                return Number(r.timestamp || r.createdAt || 0);
            };

            cloudList.forEach(cItem => {
                if (!cItem || !cItem.id) return;
                const strId = String(cItem.id);
                if (pendingDeletes.has(strId)) return;
                mergedMap.set(strId, normalizeFn ? normalizeFn(cItem) : cItem);
            });

            (localList || []).forEach(lItem => {
                if (!lItem || !lItem.id) return;
                const strId = String(lItem.id);
                if (pendingDeletes.has(strId)) return;

                const normLocal = normalizeFn ? normalizeFn(lItem) : lItem;
                if (!mergedMap.has(strId)) {
                    // Record exists in local cache but not in cloud yet -> keep & auto-push
                    mergedMap.set(strId, normLocal);
                    unsyncedToPush.push({
                        id: strId,
                        data: docTypeTag ? { ...normLocal, docType: docTypeTag, recordType: docTypeTag } : normLocal
                    });
                } else {
                    const cItem = mergedMap.get(strId);
                    if (getRecordTime(normLocal) > getRecordTime(cItem)) {
                        mergedMap.set(strId, normLocal);
                        unsyncedToPush.push({
                            id: strId,
                            data: docTypeTag ? { ...normLocal, docType: docTypeTag, recordType: docTypeTag } : normLocal
                        });
                    }
                }
            });

            const sortedList = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
            return { sortedList, unsyncedToPush };
        }

        async function bootFirebase(recreateApp = false) {
            try {
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }

                updateSyncBadge('SYNCING', `Connecting to /${activeCollectionName}...`);

                if (recreateApp && getApps().length > 0) {
                    try {
                        await deleteApp(getApp());
                        db = null;
                        currentInitializedProjectId = null;
                    } catch (e) {
                        console.warn('App cleanup warning:', e);
                    }
                }

                let app;
                if (getApps().length === 0) {
                    app = initializeApp(activeFirebaseConfig);
                    db = initializeFirestore(app, { experimentalForceLongPolling: true });
                    currentInitializedProjectId = activeFirebaseConfig.projectId;
                } else {
                    app = getApp();
                    if (!db) {
                        try {
                            db = initializeFirestore(app, { experimentalForceLongPolling: true });
                        } catch (initErr) {
                            db = getFirestore(app);
                        }
                    }
                    currentInitializedProjectId = activeFirebaseConfig.projectId;
                }

                unsubscribeSnapshot = onSnapshot(collection(db, activeCollectionName), async (snap) => {
                    window.state.isCloudConnected = true;
                    window.state.totalCloudDocs = snap.size;

                    const pendingDeletes = getPendingDeletes();

                    // Flush any queued offline deletes to Firestore first
                    if (pendingDeletes.size > 0) {
                        for (const delId of Array.from(pendingDeletes)) {
                            try {
                                await deleteDoc(doc(db, activeCollectionName, delId));
                                pendingDeletes.delete(delId);
                            } catch (e) {}
                        }
                        savePendingDeletes(pendingDeletes);
                    }

                    const cloudSales = [];
                    const cloudExpenses = [];
                    const cloudUdhaar = [];
                    const cloudBin = [];

                    snap.docs.forEach(docSnap => {
                        const data = docSnap.data() || {};
                        const id = docSnap.id;
                        if (pendingDeletes.has(String(id))) return;

                        const type = data.docType || data.recordType || '';

                        if (id === 'shop_settings' || type === 'settings') {
                            if (data.shopName) window.state.shopName = data.shopName;
                            if (data.shopSub) window.state.shopSub = data.shopSub;
                            if (data.shopGst) window.state.shopGst = data.shopGst;
                            window.applyBrandingToDOM(false);
                            return;
                        }

                        const record = { id, ...data };
                        if (type === 'bin' || Boolean(data.deletedAt)) {
                            cloudBin.push(record);
                        } else if (type === 'sale' || id.startsWith('sale_')) {
                            cloudSales.push(record);
                        } else if (type === 'expense' || id.startsWith('exp_')) {
                            cloudExpenses.push(record);
                        } else if (type === 'udhaar' || id.startsWith('udh_')) {
                            cloudUdhaar.push(record);
                        }
                    });

                    // Smart merge so offline-created or newer local records are never wiped out on page load
                    const salesMerge = mergeCloudAndLocalList(cloudSales, window.state.sales, pendingDeletes, null, 'sale');
                    const expMerge = mergeCloudAndLocalList(cloudExpenses, window.state.expenses, pendingDeletes, null, 'expense');
                    const udhMerge = mergeCloudAndLocalList(cloudUdhaar, window.state.udhaar, pendingDeletes, null, 'udhaar');
                    const binMerge = mergeCloudAndLocalList(cloudBin, window.state.bin, pendingDeletes, null, 'bin');

                    window.state.sales = salesMerge.sortedList;
                    window.state.expenses = expMerge.sortedList;
                    window.state.udhaar = udhMerge.sortedList;
                    window.state.bin = binMerge.sortedList;
                    window.purgeExpiredBinItems();

                    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
                        sales: window.state.sales,
                        expenses: window.state.expenses,
                        udhaar: window.state.udhaar,
                        bin: window.state.bin,
                        shopName: window.state.shopName,
                        shopSub: window.state.shopSub,
                        shopGst: window.state.shopGst
                    }));

                    updateSyncBadge('CONNECTED');
                    window.refreshAllViews();

                    // Auto-push any unsynced local records discovered during the merge
                    const allUnsynced = [
                        ...salesMerge.unsyncedToPush,
                        ...expMerge.unsyncedToPush,
                        ...udhMerge.unsyncedToPush,
                        ...binMerge.unsyncedToPush
                    ];
                    if (allUnsynced.length > 0) {
                        try {
                            await commitBatchRecords(allUnsynced);
                        } catch (pushErr) {
                            console.warn('Auto-sync of offline records warning:', pushErr);
                        }
                    }
                }, (err) => {
                    console.warn('Firestore listener error:', err);
                    updateSyncBadge('ERROR', err.code || err.message);
                });
            } catch (err) {
                console.warn('Firebase init error:', err);
                updateSyncBadge('ERROR', err.code || err.message);
            }
        }

        


// 4. Unified Boot Sequence
function bootApp() {
    injectSharedModals();
    const nowHdr = new Date();
    const weekdayStr = nowHdr.toLocaleDateString('en-IN', { weekday: 'long' });
    const dateEl = document.getElementById('current-date-display');
    if (dateEl) dateEl.textContent = `${weekdayStr}, ${window.formatDisplayDate(window.getLocalTodayYMD())}`;

    window.loadLocalCache();
    window.purgeExpiredBinItems();
    window.applyBrandingToDOM();
    if (typeof window.onPageInit === 'function') {
        window.onPageInit();
    }
    window.refreshAllViews();
    bootFirebase();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}
