import { Trigger } from '../JassOverrides/Trigger';

export class DarkCorruption {
    private readonly abilityId: number = FourCC('A036');
    private readonly summonId: number = FourCC('u001');
    private readonly darkSummoningId: number = FourCC('A04A');
    private summonCount: number = 0;
    private readonly trig: Trigger = new Trigger();

    constructor() {
        this.trig.addAction(() => this.action());
        this.trig.registerAnyUnitEventBJ(EVENT_PLAYER_UNIT_DEATH);
    }

    private action(): void {
        if (GetUnitTypeId(GetDyingUnit()) === this.summonId) {
            this.summonCount--;
        } else if (
            this.summonCount < 5 &&
            GetUnitAbilityLevel(GetKillingUnit(), this.abilityId) > 0 &&
            IsUnitEnemy(GetDyingUnit(), GetOwningPlayer(GetKillingUnit()))
        ) {
            const darkSummoningLevel: number = GetUnitAbilityLevel(GetKillingUnit(), this.darkSummoningId);
            const x: number = GetUnitX(GetDyingUnit());
            const y: number = GetUnitY(GetDyingUnit());
            const intelligence: number = GetHeroInt(GetKillingUnit(), true);
            const summon: unit = CreateUnit(GetOwningPlayer(GetKillingUnit()), this.summonId, x, y, bj_UNIT_FACING);
            const maxHealth: number = darkSummoningLevel > 0 ? 4 * intelligence + 75 * darkSummoningLevel : 2 * intelligence;
            const damage: number = darkSummoningLevel > 0 ? Math.ceil(2 * intelligence + 5 * darkSummoningLevel) : Math.ceil(intelligence);

            BlzSetUnitMaxHP(summon, maxHealth);
            SetUnitState(summon, UNIT_STATE_LIFE, maxHealth);
            SetUnitLifePercentBJ(summon, 100);
            BlzSetUnitRealField(summon, UNIT_RF_HIT_POINTS_REGENERATION_RATE, -0.5 * (maxHealth / 10));
            BlzSetUnitBaseDamage(summon, damage, 0);
            // BlzSetUnitArmor( summon, 10.00 )
            // BlzSetUnitAttackCooldown(summon, 2.00, 1)
            // BlzSetUnitDiceSides(summon, 1, 1)
            // BlzSetUnitDiceNumber(summon, 4, 1)

            // UnitApplyTimedLifeBJ(10, this.timedLifeBuffId, summon);
        }
    }
}
