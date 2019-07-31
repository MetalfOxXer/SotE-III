import { Teleporter } from './Teleporter';

export abstract class SpawnTeleporter extends Teleporter {
    protected abstract readonly playerId: number;

    constructor(entranceRegion: rect, exitRegion: rect) {
        super(entranceRegion, exitRegion);

        this.trig.AddCondition(() => this.condition());
    }

    protected condition(): boolean {
        return GetPlayerId(GetOwningPlayer(GetTriggerUnit())) === this.playerId;
    }

    protected action(): void {
        super.action();

        SetUnitLifePercentBJ(GetTriggerUnit(), 100);
        SetUnitManaPercentBJ(GetTriggerUnit(), 100);
    }
}
