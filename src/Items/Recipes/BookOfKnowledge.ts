import { ItemRecipe } from '../ItemRecipe';
import { ItemLabel } from '../ItemLabel';
import { OrbOfMagic } from '../BasicItems/OrbOfMagic';

const itemId: number = FourCC('I034');
const name: string = 'Book of Knowledge';
const labels: ItemLabel[] = [ItemLabel.INTELLIGENCE];
const goldCost: number = 1800;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNManual3.blp';
const description: string = `A book full of information about the strangest things.

|cffffcc00Intelligence:|r +18

|cFF808080Intelligence increases the damage done by your spells.|r`;

export class BookOfKnowledge extends ItemRecipe {
    constructor(orbOfMagic: OrbOfMagic) {
        super(itemId, name, labels, goldCost, iconPath, description, [orbOfMagic, orbOfMagic]);
    }
}
