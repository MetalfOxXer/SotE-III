import { ItemRecipe } from '../ItemRecipe';
import { EmptyVial } from '../BasicItems/EmptyVial';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I015');
const name: string = 'Mana Egg';
const labels: ItemLabel[] = [ItemLabel.MAX_MANA];
const goldCost: number = 1050;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNManaStone.blp';
const description: string = `An egg surging with magical energy.

|cffffcc00Max Mana:|r +350

|cFF808080Mana is required when casting most spells.|r`;

export class ManaEgg extends ItemRecipe {
    constructor(emptyVial: EmptyVial) {
        super(itemId, name, labels, goldCost, iconPath, description, [emptyVial]);
    }
}
