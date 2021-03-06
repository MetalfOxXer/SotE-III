import { Item } from '../Item';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I02J');
const name: string = 'Bloodied Sacrificial Dagger';
const labels: ItemLabel[] = [];
const goldCost: number = 3000;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNBloodiedSacrifice.blp';
const description: string = `A dagger often used by acolytes in sacrificial rituals

|cffffcc00Use:|r Deals 1000 damage to target enemy unit
|cffffcc00Mana Cost:|r 0
|cffffcc00Range:|r 500
|cffffcc00Cooldown:|r 60

|cFF808080Use is an effect that occurs when an item is used by clicking on it.|r`;

export class BloodiedSacrificialDagger extends Item {
    constructor() {
        super(itemId, name, labels, goldCost, iconPath, description);
    }
}
