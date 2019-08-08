import { Spell } from './Spell';
import { StunUtils } from '../Utility/StunUtils';
import { GroupInRange } from '../JassOverrides/GroupInRange';

export class Permafrost extends Spell {
    protected readonly abilityId: number = FourCC('A01I');
    private readonly stunUtils: StunUtils;

    constructor(stunUtils: StunUtils) {
        super();

        this.stunUtils = stunUtils;
    }

    protected action(): void {
        const trig: unit = GetTriggerUnit();
        const loc: location = GetUnitLoc(trig);
        const grp: GroupInRange = new GroupInRange(1000.00, loc);
        const abilityLevel: number = GetUnitAbilityLevel(trig, this.abilityId);
        const intelligence: number = GetHeroInt(trig, true);
        const damage: number = 50.00 * abilityLevel + 1.00 * intelligence;

        grp.for(() => {
            if (IsUnitEnemy(GetEnumUnit(), GetOwningPlayer(trig))) {
                UnitDamageTargetBJ(trig, GetEnumUnit(), damage, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_NORMAL);
                this.stunUtils.stunUnit(GetEnumUnit(), 2);
            }
        });

        RemoveLocation(loc);
        grp.destroy();
    }
}
