import { ItemRecipe } from '../ItemRecipe';
import { BootsOfSpeed } from '../BaseItems/BootsOfSpeed';
import { CloakOfShadows } from '../BaseItems/CloakOfShadows';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I01J');
const name: string = 'Cloak of Shadow Walk';
const labels: ItemLabel[] = [];
const goldCost: number = 930;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNAcolyteCloak.blp';
const description: string = `A cloak that lets you blend in with the shadows while moving.

|cffffcc00Movement Speed:|r +80
|cffffcc00Effect:|r Turns the wearer invisible if they're standing perfectly still
|cffffcc00Use:|r Turns the wearer invisible even while moving for a short duration
|cffffcc00Mana Cost:|r 75
|cffffcc00Duration:|r 5
|cffffcc00Cooldown:|r 60

|cFF808080Effects are special properties that usually trigger on an event.|r`;

export class CloakOfShadowWalk extends ItemRecipe {
    constructor(cloakOfShadows: CloakOfShadows, bootsOfSpeed: BootsOfSpeed) {
        super(itemId, name, labels, goldCost, iconPath, description, [cloakOfShadows, bootsOfSpeed]);
    }
}
