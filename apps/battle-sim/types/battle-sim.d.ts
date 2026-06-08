export {};

declare global {
  type BattleStatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
  type BattleBoostKey = 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'accuracy' | 'evasion';
  type MoveCategory = 'Physical' | 'Special' | 'Status' | 'phys' | 'spec' | 'status' | string;

  interface StatTable {
    hp?: number;
    atk?: number;
    def?: number;
    spa?: number;
    spd?: number;
    spe?: number;
    [key: string]: number | undefined;
  }

  interface BoostTable {
    atk?: number;
    def?: number;
    spa?: number;
    spd?: number;
    spe?: number;
    accuracy?: number;
    evasion?: number;
    [key: string]: number | undefined;
  }

  interface VolatileState {
    destinyBond?: boolean;
    grudge?: boolean;
    substitute?: number;
    shedTailSub?: number;
    leechseed?: boolean | number;
    partiallytrapped?: boolean | number;
    curse?: boolean | number;
    saltcure?: boolean | number;
    syrupbomb?: number;
    yawn?: number;
    ingrain?: boolean | number;
    chargingMove?: string;
    disable?: number;
    disabledMove?: string;
    taunt?: number;
    encore?: number;
    encoreMove?: string;
    confusion?: number;
    flinch?: boolean;
    protect?: boolean;
    endure?: boolean;
    healBlock?: number;
    [key: string]: any;
  }

  interface MoveFlags {
    contact?: boolean | number;
    protect?: boolean | number;
    reflectable?: boolean | number;
    sound?: boolean | number;
    bite?: boolean | number;
    punch?: boolean | number;
    pulse?: boolean | number;
    bullet?: boolean | number;
    dance?: boolean | number;
    charge?: boolean | number;
    slicing?: boolean | number;
    [key: string]: boolean | number | string | undefined;
  }

  interface MoveData {
    id?: string;
    name: string;
    cn?: string;
    cnName?: string;
    type?: string;
    power?: number;
    basePower?: number;
    cat?: MoveCategory;
    category?: MoveCategory;
    accuracy?: number | true;
    priority?: number;
    target?: string;
    flags?: MoveFlags;
    secondary?: Record<string, any> | null;
    secondaries?: Array<Record<string, any>>;
    boosts?: Record<string, number>;
    self?: Record<string, any>;
    heal?: [number, number];
    drain?: [number, number];
    recoil?: [number, number];
    status?: string;
    volatileStatus?: string;
    forceSwitch?: boolean | number;
    sleepUsable?: boolean;
    pseudoWeather?: string;
    sideCondition?: string;
    slotCondition?: string;
    weather?: string;
    isFutureMove?: boolean;
    stallingMove?: boolean;
    struggleRecoil?: boolean;
    selfdestruct?: boolean | 'always';
    mindBlownRecoil?: boolean;
    isZ?: boolean;
    isMax?: boolean;
    isNonstandard?: string | boolean | null;
    _ateBoost?: number;
    _weatherPowerLog?: string;
    _bounced?: boolean;
    _prankster?: boolean;
    [key: string]: any;
  }

  interface PPMoveLike extends MoveData {
    pp?: number;
    maxPp?: number;
    isStruggle?: boolean;
  }

  interface PokemonLike {
    name: string;
    cnName?: string;
    displayCnName?: string;
    level?: number;
    lv?: number;
    types?: string[];
    ability?: string;
    item?: string | null;
    status?: string | null;
    statusTurns?: number;
    sleepTurns?: number;
    currHp: number;
    maxHp: number;
    atk?: number;
    def?: number;
    spa?: number;
    spd?: number;
    spe?: number;
    stats?: StatTable;
    boosts?: BoostTable;
    volatile?: VolatileState;
    moves?: PPMoveLike[];
    isTerastallized?: boolean;
    teraType?: string | null;
    isDynamaxed?: boolean;
    isMega?: boolean;
    isTransformed?: boolean;
    needsInitTransform?: boolean;
    turnsOnField?: number;
    turnCount?: number;
    turnData?: Record<string, any>;
    lastMoveUsed?: string | MoveData | null;
    lastBaseMoveUsed?: string | null;
    lastMoveFailed?: boolean;
    mustRecharge?: boolean;
    avs?: Record<string, number>;
    avsEvolutionBoost?: boolean;
    commandDodgeActive?: boolean;
    choiceLocked?: boolean;
    choiceLockedMove?: string | null;
    illusionActive?: boolean;
    illusionTarget?: PokemonLike | null;
    displayName?: string;
    baseStats?: StatTable;
    originalName?: string;
    preDynamaxMaxHp?: number;
    preDynamaxCurrHp?: number;
    timesAttacked?: number;
    getStat?(stat: string): number;
    getEffectiveAVs?(stat: string): number;
    getSprite?(isBack?: boolean): string;
    isAlive?(): boolean;
    takeDamage?(damage: number, category?: string | null): number | void;
    heal?(amount: number, options?: Record<string, any>): number;
    applyBoost?(stat: string, amount: number): number;
    resetBoosts?(): void;
    [key: string]: any;
  }

  interface Pokemon extends PokemonLike {}

  interface BattleSide {
    stealthrock?: boolean;
    spikes?: number;
    toxicspikes?: number;
    stickyweb?: boolean;
    reflect?: number;
    lightscreen?: number;
    auroraveil?: number;
    tailwind?: number;
    [key: string]: any;
  }

  interface BattleStateLike {
    weather?: string | null;
    environmentWeather?: string | null;
    terrain?: string | null;
    field?: Record<string, any>;
    turn?: number;
    turnCount?: number;
    isPlayerTurn?: boolean;
    aiDifficulty?: string;
    weatherTurns?: number;
    terrainTurns?: number;
    playerUnlocks?: Record<string, any>;
    enemyUnlocks?: Record<string, any>;
    playerSide?: BattleSide;
    enemySide?: BattleSide;
    playerParty?: PokemonLike[];
    enemyParty?: PokemonLike[];
    playerActive?: number;
    enemyActive?: number;
    lastMoveUsed?: string | MoveData | null;
    destinyBondCauser?: 'player' | 'enemy' | string | undefined;
    playerForcedSwitch?: boolean;
    forceSwitchResolve?: ((value?: unknown) => void) | null;
    locked?: boolean;
    phase?: string | null;
    pivotSide?: 'player' | 'enemy' | string | null;
    pivotResolve?: ((value?: unknown) => void) | null;
    playerFaintCount?: number;
    enemyFaintCount?: number;
    getPlayer?(): PokemonLike | undefined;
    getEnemy?(): PokemonLike | undefined;
    getPlayerSide?(): BattleSide;
    getEnemySide?(): BattleSide;
    addLog?(message: string): void;
    checkBattleEnd?(): 'win' | 'loss' | 'draw' | string | null;
    nextAliveEnemy?(): boolean;
    nextAlivePlayer?(): boolean | void;
    [key: string]: any;
  }

  interface DamageResult {
    damage: number;
    effectiveness: number;
    isCrit?: boolean;
    miss?: boolean;
    hitCount?: number;
    blocked?: boolean;
    failed?: boolean;
    fixedDamage?: boolean;
    charging?: boolean;
    weatherBlocked?: boolean;
    protectBlocked?: boolean;
    [key: string]: any;
  }

  interface AiAction {
    type: 'move' | 'switch' | 'item' | string;
    move?: MoveData | string;
    index?: number;
    switchIndex?: number;
    target?: PokemonLike;
    reason?: string;
    reasoning?: string;
    score?: number;
    style?: string | null;
    forced?: boolean;
    [key: string]: any;
  }

  interface BattleTurnContext {
    battle?: BattleStateLike | null;
    turnCount?: number;
    isPlayerTurn?: boolean;
    settings?: Record<string, any>;
    [key: string]: any;
  }

  interface TurnCheckResult {
    can?: boolean;
    canMove?: boolean;
    msg?: string;
    reason?: string;
    [key: string]: any;
  }

  interface SwitchFlowResult {
    canSwitch?: boolean;
    reason?: string;
    pivot?: boolean;
    passSub?: boolean;
    passBoosts?: boolean;
    phaze?: boolean;
    revivalChoice?: boolean;
    [key: string]: any;
  }

  interface EndTurnStatusResult {
    logs: string[];
    fainted?: boolean;
    [key: string]: any;
  }

  interface AiBattleContext {
    turnCount?: number;
    settings?: Record<string, any>;
    battle?: BattleStateLike | null;
    [key: string]: any;
  }

  interface AiMoveScore {
    move: MoveData;
    score: number;
    [key: string]: any;
  }

  interface PPDeductResult {
    success: boolean;
    noPP?: boolean;
    logs: string[];
  }

  interface PPSystemLike {
    hasPP(move?: PPMoveLike | null): boolean;
    allPPDepleted(pokemon?: PokemonLike | null): boolean;
    findMove(pokemon?: PokemonLike | null, moveName?: string | null): PPMoveLike | null;
    deductPP(user?: PokemonLike | null, move?: PPMoveLike | MoveData | null, target?: PokemonLike | null): PPDeductResult;
    applySpite(target?: PokemonLike | null): string[];
    applyGrudge(fainted?: PokemonLike | null, attacker?: PokemonLike | null): string[];
    setGrudge(user?: PokemonLike | null): void;
    applyEerieSpell(target?: PokemonLike | null): string[];
    applyGMaxDepletion(target?: PokemonLike | null): string[];
    checkLeppaBerry(pokemon?: PokemonLike | null, move?: PPMoveLike | null): string | null;
    restorePP(move?: PPMoveLike | null, amount?: number): void;
    restoreAllPP(pokemon?: PokemonLike | null): void;
    setLunarDanceHeal(battle?: BattleStateLike | null, isPlayer?: boolean): void;
    applyLunarDanceOnSwitch(pokemon?: PokemonLike | null, battle?: BattleStateLike | null, isPlayer?: boolean): string[];
    applyTransformPP(user?: PokemonLike | null, target?: PokemonLike | null): string[];
    getTrumpCardPower(user?: PokemonLike | null): number;
    createStruggle(): PPMoveLike;
    getUsableMoves(pokemon?: PokemonLike | null): PPMoveLike[];
  }

  interface MoveHandler {
    basePowerCallback?: (...args: any[]) => any;
    damageCallback?: (...args: any[]) => any;
    onHit?: (...args: any[]) => any;
    onMiss?: (...args: any[]) => any;
    onUse?: (...args: any[]) => any;
    onAfterMove?: (...args: any[]) => any;
    onModifyType?: (...args: any[]) => any;
    isChargeMove?: boolean;
    [key: string]: any;
  }
}
