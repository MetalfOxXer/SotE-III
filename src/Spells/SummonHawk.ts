import { Spell } from './Spell';
import { TimerUtils } from '../Utility/TimerUtils';
import { Timer } from '../JassOverrides/Timer';
import { GameGlobals } from '../Game/GameGlobals';

export class SummonHawk extends Spell {
    protected readonly abilityId: number = FourCC('A00R');
    private readonly chainLightningAbilityId: number = FourCC('A04J');
    private readonly forkedLightningAbilityId: number = FourCC('A04K');
    private readonly spellImmunityAbilityId: number = FourCC('ACmi');
    private readonly summonId: number = FourCC('n00D');
    private summonUnit: unit[] = [];
    private readonly gameGlobals: GameGlobals;
    private readonly timerUtils: TimerUtils;

    constructor(gameGlobals: GameGlobals, timerUtils: TimerUtils) {
        super();

        this.gameGlobals = gameGlobals;
        this.timerUtils = timerUtils;
    }

    protected action(): void {
        const trig: unit = GetTriggerUnit();
        const abilityLevel: number = GetUnitAbilityLevel(trig, this.abilityId);
        const facing: number = GetUnitFacing(trig);
        const x: number = GetUnitX(trig) + 50 * Math.cos((facing * Math.PI) / 180);
        const y: number = GetUnitY(trig) + 50 * Math.sin((facing * Math.PI) / 180);
        const int: number = GetHeroInt(trig, true);
        const playerId: number = GetPlayerId(GetOwningPlayer(trig));

        if (this.summonUnit[playerId]) {
            RemoveUnit(this.summonUnit[playerId]);
        }

        this.summonUnit[playerId] = CreateUnit(GetOwningPlayer(trig), this.summonId, x, y, bj_UNIT_FACING);
        DestroyEffect(AddSpecialEffect('Abilities\\Spells\\Orc\\FeralSpirit\\feralspiritdone.mdl', x, y));

        this.gameGlobals.SummonHawkInt[GetPlayerId(GetOwningPlayer(trig))] = int;

        BlzSetUnitMaxHP(this.summonUnit[playerId], Math.ceil(75 * abilityLevel + 7.5 * int));
        SetUnitLifePercentBJ(this.summonUnit[playerId], 100);
        BlzSetUnitBaseDamage(this.summonUnit[playerId], Math.ceil(2.25 * abilityLevel + 0.75 * int), 0);

        if (abilityLevel > 2) {
            UnitAddAbility(this.summonUnit[playerId], this.chainLightningAbilityId);
        }

        if (abilityLevel > 4) {
            UnitAddAbility(this.summonUnit[playerId], this.forkedLightningAbilityId);
        }

        if (abilityLevel > 7) {
            UnitAddAbility(this.summonUnit[playerId], this.spellImmunityAbilityId);
        }

        const maxDistance: number = 1200;
        const t: Timer = this.timerUtils.newTimer();
        t.start(1, true, () => {
            const newX: number = GetUnitX(trig);
            const newY: number = GetUnitY(trig);
            const distance: number = Math.sqrt(
                Pow(GetUnitX(this.summonUnit[playerId]) - newX, 2) + Pow(GetUnitY(this.summonUnit[playerId]) - newY, 2),
            );

            if (distance > maxDistance) {
                SetUnitPosition(this.summonUnit[playerId], newX, newY);
                IssueTargetOrderBJ(this.summonUnit[playerId], 'move', trig);
            }

            if (!UnitAlive(this.summonUnit[playerId])) {
                this.summonUnit.splice(playerId, 1);
                this.timerUtils.releaseTimer(t);
            }
        });
    }
}
