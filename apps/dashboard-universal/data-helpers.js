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
