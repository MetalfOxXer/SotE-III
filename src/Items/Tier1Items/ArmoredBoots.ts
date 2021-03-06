import { ItemRecipe } from '../ItemRecipe';
import { BootsOfSpeed } from '../BaseItems/BootsOfSpeed';
import { ItemLabel } from '../ItemLabel';
import { IronShield } from '../BaseItems/IronShield';

const itemId: number = FourCC('I01C');
const name: string = 'Armored Boots';
const labels: ItemLabel[] = [ItemLabel.BLOCK];
const goldCost: number = 1160;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNBoots.blp';
const description: string = `Increases movement rate while keeping your feet safe.

|cffffcc00Movement Speed:|r +50
|cffffcc00Block:|r +20
|cffffcc00Unique:|r Increases block by +10%

|cFF808080Movement speed determines how fast you're able to move.|r`;

export class ArmoredBoots extends ItemRecipe {
    constructor(bootsOfSpeed: BootsOfSpeed, ironShield: IronShield) {
        super(itemId, name, labels, goldCost, iconPath, description, [bootsOfSpeed, ironShield]);
    }
}
