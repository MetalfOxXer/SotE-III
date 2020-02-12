import { ItemRecipe } from '../ItemRecipe';
import { WandOfShadowsight } from './WandOfShadowsight';
import { ClockworkPenguin } from '../BasicItems/ClockworkPenguin';
import { ItemLabel } from '../ItemLabel';

const itemId: number = FourCC('I02C');
const name: string = 'Snowy Owl';
const labels: ItemLabel[] = [];
const goldCost: number = 700;
const iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNSnowOwl.blp';
const description: string = `It is said that these creatures can see the dead.

|cffffcc00Effect:|r A clockwork penguin with 6 inventory spaces that will always stay by your side and follow you around.

|cFF808080Effects are special properties that usually trigger on an event.|r`;

export class SnowyOwl extends ItemRecipe {
    constructor(clockworkPenguin: ClockworkPenguin, wandOfShadowsight: WandOfShadowsight) {
        super(itemId, name, labels, goldCost, iconPath, description, [clockworkPenguin, wandOfShadowsight]);
    }
}
