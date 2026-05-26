/* ============================================================
   DATA HELPERS - Lookup & Utility Functions
   Pure functions that bridge clean JSON data with UI presentation
   ============================================================ */

// Type color palette
const TypeColors = {
    'normal': '#b2bec3',
    'fire': '#ff6b6b',
    'water': '#54a0ff',
    'electric': '#feca57',
    'grass': '#2ecc71',
    'ice': '#74b9ff',
    'fighting': '#d35400',
    'poison': '#9b59b6',
    'ground': '#e17055',
    'flying': '#7fbbf9',
    'psychic': '#eb2f06',
    'bug': '#badc58',
    'rock': '#95a5a6',
    'ghost': '#a55eea',
    'dragon': '#8854d0',
    'dark': '#2d3436',
    'steel': '#95a5a6',
    'fairy': '#fd79a8'
};

var ZoneDB = {
    'N': { name: 'NEON', label: 'Dist.N', color: '#e056fd', shadow: 'rgba(224, 86, 253, 0.35)' },
    'B': { name: 'BLOOM', label: 'Dist.B', color: '#00cec9', shadow: 'rgba(0, 206, 201, 0.35)' },
    'S': { name: 'SHADOW', label: 'Dist.S', color: '#636e72', shadow: 'rgba(99, 110, 114, 0.4)' },
    'A': { name: 'APEX', label: 'Dist.A', color: '#eb4d4b', shadow: 'rgba(235, 77, 75, 0.35)' },
    'Z': { name: 'ZENITH', label: 'Cent.Z', color: '#f9ca24', shadow: 'rgba(249, 202, 36, 0.4)' }
};

var BondManifest = {
    'gloria': { key: 'enable_dynamax', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png', label: 'DYNAMAX BOND' },
    'rosa': { key: 'enable_bond', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soothe-bell.png', label: 'LINK BOND' },
    'dawn': { key: 'enable_insight', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png', label: 'INSIGHT LENS' },
    'akari': { key: 'enable_styles', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png', label: 'HISUI ARTS' },
    'serena': { key: 'enable_mega', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mega-ring.png', label: 'MEGA EVO' },
    'selene': { key: 'enable_z_move', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/z-ring.png', label: 'Z POWER' },
    'juliana': { key: 'enable_tera', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/normal-gem.png', label: 'TERASTAL' },
    'may': { key: 'enable_proficiency_cap', icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png', label: 'LIMIT BREAK' }
};

var SystemIcons = {
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
    gig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    transit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 20l-1.5 2.5"></path><path d="M15 20l1.5 2.5"></path></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    mart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    unite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`
};

/**
 * [Modified] Get Item Sprite URL (with PS fallback)
 * Primary: PokeAPI (kebab-case: "Choice Specs" -> "choice-specs")
 * Fallback: Pokemon Showdown (clean: "Choice Specs" -> "choicespecs")
 */
function getItemIconUrl(itemKey) {
    if (!itemKey) return null;
  
    // PokeAPI 规则：转小写，空格下划线换成中划线，去除非法字符
    // 例如: "Choice Specs" -> "choice-specs"
    const slugPokeAPI = itemKey.toString().toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // 使用 PokeAPI 的 GitHub 仓库
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slugPokeAPI}.png`;
}

/**
 * Get Pokemon Showdown item icon URL (fallback)
 * PS 规则：去除所有非字母数字字符
 * 例如: "King's Rock" -> "kingsrock"
 */
function getItemIconUrlPS(itemKey) {
    if (!itemKey) return null;
    
    // PS 的规则：去空格、去横杠、去引号，只留字母数字
    const slugPS = itemKey.toString().toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    
    return `https://play.pokemonshowdown.com/sprites/itemicons/${slugPS}.png`;
}

/**
 * Normalize a species name into a sprite slug
 * Handles regional adjectives (Hisuian, Alolan, etc.)
 */
function buildSpriteSlug(speciesRaw) {
    if (!speciesRaw) return '';

    let slug = speciesRaw.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const prefixRules = [
        { prefixes: ['hisuian-', 'hisuian', 'hisui-', 'hisui'], suffix: '-hisui' },
        { prefixes: ['arcean-', 'arcean', 'arcrean-', 'arcrean'], suffix: '-hisui' },
        { prefixes: ['alolan-', 'alolan', 'alola-', 'alola'], suffix: '-alola' },
        { prefixes: ['galarian-', 'galarian', 'galar-', 'galar'], suffix: '-galar' },
        { prefixes: ['paldean-', 'paldean', 'paldea-', 'paldea'], suffix: '-paldea' }
    ];

    for (const rule of prefixRules) {
        for (const prefix of rule.prefixes) {
            if (slug.startsWith(prefix)) {
                const base = slug.slice(prefix.length).replace(/^-+/, '');
                return `${base}${rule.suffix}`;
            }
        }
    }

    const suffixRules = ['hisui', 'alola', 'galar', 'paldea'];
    for (const suffix of suffixRules) {
        if (slug.endsWith(suffix) && !slug.endsWith(`-${suffix}`)) {
            const base = slug.slice(0, -suffix.length).replace(/-+$/, '');
            return `${base}-${suffix}`;
        }
    }

    return slug;
}

/**
 * Get sprite URL from species name
 * Uses PokemonDB naming convention by default
 */
function getSpriteUrl(speciesRaw) {
    const slug = buildSpriteSlug(speciesRaw);
    if (!slug) return '';
    return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${slug}.png`;
}

/**
 * Get theme colors and types from species
 * Looks up POKEDEX global variable
 */
function getThemeColors(speciesRaw) {
    const fallback = { p: '#b2bec3', s: '#dfe6e9', types: ['normal'] };
    
    if (!speciesRaw || typeof POKEDEX === 'undefined') return fallback;
    
    const key = speciesRaw.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    const dexEntry = POKEDEX[key];
    
    if (!dexEntry || !dexEntry.types) return fallback;
    
    const types = dexEntry.types.map(t => t.toLowerCase());
    const typeA = types[0];
    const typeB = types[1] || typeA;
    
    return {
        p: TypeColors[typeA] || fallback.p,
        s: TypeColors[typeB] || fallback.s,
        types: types
    };
}

/**
 * Get type color by type name
 */
function getTypeColor(typeName) {
    return TypeColors[typeName.toLowerCase()] || TypeColors['normal'];
}
