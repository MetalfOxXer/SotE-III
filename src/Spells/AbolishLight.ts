import { Spell } from './Spell';
import { GroupInRange } from '../JassOverrides/GroupInRange';

export class AbolishLight extends Spell {
    protected readonly abilityId: number = FourCC('A04C');

    protected action(): void {
        const trig: unit = GetTriggerUnit();
        const abilityLevel: number = GetUnitAbilityLevel(trig, this.abilityId);
        const intelligence: number = GetHeroInt(trig, true);
        const totalDamageAndHealing: number = 125 * abilityLevel + 2 * intelligence;

        const loc: location = GetUnitLoc(trig);
        const grp: GroupInRange = new GroupInRange(600, loc);
        const allies: unit[] = [];
        const enemies: unit[] = [];
        grp.for((u: unit) => {
            if (IsUnitAlly(u, GetOwningPlayer(trig))) {
                allies.push(u);
            } else {
                enemies.push(u);
            }
        });
        grp.destroy();
        RemoveLocation(loc);

        const fractionedDamageAndHealing: number = totalDamageAndHealing / (allies.length + enemies.length);
        for (let i: number = 0; i < allies.length; i++) {
            SetUnitState(allies[i], UNIT_STATE_LIFE, GetUnitState(allies[i], UNIT_STATE_LIFE) + fractionedDamageAndHealing);
            DestroyEffect(AddSpecialEffectTarget('Abilities\\Spells\\Undead\\DeathCoil\\DeathCoilSpecialArt.mdl', allies[i], 'origin'));
        }

        for (let i: number = 0; i < enemies.length; i++) {
            UnitDamageTargetBJ(trig, enemies[i], fractionedDamageAndHealing, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_NORMAL);
            DestroyEffect(AddSpecialEffectTarget('Abilities\\Spells\\Undead\\DeathCoil\\DeathCoilSpecialArt.mdl', enemies[i], 'origin'));
        }
    }
}
