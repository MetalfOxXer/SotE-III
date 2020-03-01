import { GameGlobals } from '../../Game/GameGlobals';
import { ItemDrop } from '../ItemDrop';

export class ArcaniteSpearDrop extends ItemDrop {
    protected readonly itemTypeId: number = FourCC('I03P');
    private readonly gameGlobals: GameGlobals;

    constructor(gameGlobals: GameGlobals) {
        super();

        this.gameGlobals = gameGlobals;
    }

    protected action(): void {
        const playerId: number = GetPlayerId(GetOwningPlayer(GetTriggerUnit()));
        this.gameGlobals.PlayerPiercing[playerId] -= 150;
        this.gameGlobals.ArcaniteSpearCount[playerId] -= 1;
    }
}