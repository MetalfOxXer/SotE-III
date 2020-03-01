import { ItemRecipe } from '../ItemRecipe';
import { IronSword } from '../BaseItems/IronSword';
import { Claws } from '../BaseItems/Claws';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I00P');
const name: string = 'Iron Claws';
const labels: ItemLabel[] = [ItemLabel.AGILITY, ItemLabel.ATTACK_DAMAGE];
const goldCost: number = 1040;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNClawsOfAttack.blp';
const description: string = `Sharp claws combined with speed and precision is a deadly combination.

|cffffcc00Agility:|r +6
|cffffcc00Attack damage:|r +10

|cFF808080Agility increases your attack and movement speed.|r`;

export class IronClaws extends ItemRecipe {
    constructor(ironSword: IronSword, claws: Claws) {
        super(itemId, name, labels, goldCost, iconPath, description, [ironSword, claws]);
    }
}