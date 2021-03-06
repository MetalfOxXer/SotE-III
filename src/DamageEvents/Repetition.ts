import { DamageEvent } from '../DamageEngine/DamageEvent';
import { DamageEngineGlobals } from '../DamageEngine/DamageEngineGlobals';
import { GameGlobals } from '../Game/GameGlobals';

export class Repetition implements DamageEvent {
    private readonly abilityId: number = FourCC('A048');
    private readonly gameGlobals: GameGlobals;

    constructor(gameGlobals: GameGlobals) {
        this.gameGlobals = gameGlobals;
    }

    public event(globals: DamageEngineGlobals): void {
        if (globals.IsDamageSpell) {
            return;
        }

        const abilityLevel: number = GetUnitAbilityLevel(globals.DamageEventSource as unit, this.abilityId);
        if (abilityLevel === 0) {
            return;
        }

        const playerId: number = GetPlayerId(GetOwningPlayer(globals.DamageEventSource as unit));
        const unitHandleId: number = GetHandleId(globals.DamageEventTarget as unit);
        if (this.gameGlobals.Repetition[playerId] === unitHandleId) {
            const currentRepetitions: number = this.gameGlobals.RepetitionCounter[playerId];

            if (currentRepetitions < 7) {
                this.gameGlobals.RepetitionCounter[playerId] = currentRepetitions + 1;
            }

            globals.DamageEventAmount += 25 * abilityLevel * (currentRepetitions / 7);
        } else {
            this.gameGlobals.Repetition[playerId] = unitHandleId;
            this.gameGlobals.RepetitionCounter[playerId] = 1;
        }
    }
}
