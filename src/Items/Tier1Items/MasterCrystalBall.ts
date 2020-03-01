import { ItemRecipe } from '../ItemRecipe';
import { ItemLabel } from '../ItemLabel';
import { CrystalBall } from '../BaseItems/CrystalBall';
import { OrbOfMagic } from '../BaseItems/OrbOfMagic';

const itemId: number = FourCC('I01G');
const name: string = 'Master Crystal Ball';
const labels: ItemLabel[] = [ItemLabel.INTELLIGENCE, ItemLabel.MAX_MANA];
const goldCost: number = 2250;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNCrystalBallMaster.blp';
const description: string = `Can you see the future in this thing?

|cffffcc00Intelligence:|r +12
|cffffcc00Max Mana:|r +250
|cffffcc00Use:|r Reveals the area of the map that it is cast upon. Also reveals invisible units
|cffffcc00Mana Cost:|r 0
|cffffcc00Range:|r 99999
|cffffcc00Area of Effect:|r 1000
|cffffcc00Duration:|r 15
|cffffcc00Cooldown:|r 15

|cFF808080Use is an effects that occurs when an item is used by clicking on it.|r`;

export class MasterCrystalBall extends ItemRecipe {
    constructor(crystalBall: CrystalBall, orbOfMagic: OrbOfMagic) {
        super(itemId, name, labels, goldCost, iconPath, description, [crystalBall, orbOfMagic]);
    }
}