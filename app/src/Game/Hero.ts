import { GameGlobals } from './GameGlobals';
import { Trigger } from '../JassOverrides/Trigger';

export class Hero {
    private readonly selectRect: rect;
    private readonly heroId: number;
    private readonly dummyX: number;
    private readonly dummyY: number;
    private readonly facingAngle: number;
    private isHeroPicked: boolean = false;
    private readonly gameGlobals: GameGlobals;
    private readonly trig: Trigger = new Trigger();

    constructor(gameGlobals: GameGlobals, selectRect: rect, heroId: number, dummyX: number, dummyY: number, facingAngle: number) {
        this.selectRect = selectRect;
        this.heroId = heroId;
        this.dummyX = dummyX;
        this.dummyY = dummyY;
        this.facingAngle = facingAngle;
        this.gameGlobals = gameGlobals;

        this.trig.AddCondition(() => {
            return !this.isHeroPicked && GetUnitTypeId(GetEnteringUnit()) === FourCC('e001');
        });
        const statueUnit: unit = CreateUnit(Player(PLAYER_NEUTRAL_PASSIVE),
                                            this.heroId, this.dummyX, this.dummyY, this.facingAngle);
        this.trig.AddAction(() => {
            this.isHeroPicked = true;
            RemoveUnit(GetEnteringUnit());
            RemoveUnit(statueUnit);
            CreateUnit(GetOwningPlayer(GetEnteringUnit()), this.heroId,
                       GetRectCenterX(this.gameGlobals.PlayerSpawnRegion[GetPlayerId(GetOwningPlayer(GetEnteringUnit()))]),
                       GetRectCenterY(this.gameGlobals.PlayerSpawnRegion[GetPlayerId(GetOwningPlayer(GetEnteringUnit()))]), bj_UNIT_FACING);
        });
        this.trig.RegisterEnterRectSimple((() => this.selectRect)());
    }
}