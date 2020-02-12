import { ItemRecipe } from '../ItemRecipe';
import { MoonArmor } from '../BasicItems/MoonArmor';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I00O');
const name: string = 'Improved Moon Armor';
const labels: ItemLabel[] = [ItemLabel.RESISTANCE];
const goldCost: number = 840;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNImprovedMoonArmor.blp';
const description: string = `A special armor capable of resisting spell damage.

|cffffcc00Resistance:|r +14

|cFF808080Incoming spell damage is reduced by the amount of resistance you have.|r`;

export class ImprovedMoonArmor extends ItemRecipe {
    constructor(moonArmor: MoonArmor) {
        super(itemId, name, labels, goldCost, iconPath, description, [moonArmor]);
    }
}
