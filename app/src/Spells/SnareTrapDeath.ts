import { Trigger } from '../JassOverrides/Trigger';
import { GroupInRange } from '../JassOverrides/GroupInRange';

export class SnareTrapDeath {
    private readonly unitTypeId: number = FourCC('n00E');
    private readonly dummyUnitTypeId: number = FourCC('n001');
    private readonly dummyAbilityId: number = FourCC('A00Z');
    private readonly dummyTimedLifeAbilityId: number = FourCC('BTLF');
    private readonly trig: Trigger = new Trigger();

    constructor() {
        this.trig.AddCondition(() => {
            return GetUnitTypeId(GetTriggerUnit()) === this.unitTypeId;
        });

        this.trig.AddAction(() => {
            const loc: location = GetUnitLoc(GetDyingUnit());
            const grp: GroupInRange = new GroupInRange(150.00, loc);

            grp.For(() => {
                if (IsPlayerEnemy(GetOwningPlayer(GetTriggerUnit()), GetOwningPlayer(GetEnumUnit()))) {
                    const dummy: unit = CreateUnit(GetOwningPlayer(GetDyingUnit()),
                                                   this.dummyUnitTypeId, GetUnitX(GetEnumUnit()), GetUnitY(GetEnumUnit()), bj_UNIT_FACING);
                    UnitAddAbilityBJ(this.dummyAbilityId, dummy);
                    IssueTargetOrderBJ(dummy, 'ensnare', GetEnumUnit());
                    UnitApplyTimedLifeBJ(2, this.dummyTimedLifeAbilityId, dummy);
                }
            });

            RemoveLocation(loc);
            grp.Destroy();
        });
    }

}
