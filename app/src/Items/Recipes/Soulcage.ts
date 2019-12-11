import { ItemRecipe } from '../ItemRecipe';
import { Item } from '../Item';
import { EmptySoulcage } from '../EmptySoulcage';
import { GreenSoulstone } from '../GreenSoulstone';
import { BlueSoulstone } from '../BlueSoulstone';
import { PurpleSoulstone } from '../PurpleSoulstone';

export class Soulcage extends ItemRecipe {
    private readonly emptySoulcage: EmptySoulcage;
    private readonly greenSoulstone: GreenSoulstone;
    private readonly blueSoulstone: BlueSoulstone;
    private readonly purpleSoulstone: PurpleSoulstone;
    public readonly recipe: Item[];
    public readonly itemId: number = FourCC('I011');
    public readonly name: string = 'Soulcage';
    public readonly goldCost: number = 800;
    public readonly iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTN3M3.blp';
    public readonly description: string = `A soulcage harnessing the powers of three soulstones.

|cffffcc00Health Regen:|r +100`;

    constructor(
        emptySoulcage: EmptySoulcage,
        greenSoulstone: GreenSoulstone,
        blueSoulstone: BlueSoulstone,
        purpleSoulstone: PurpleSoulstone,
    ) {
        super();

        this.emptySoulcage = emptySoulcage;
        this.greenSoulstone = greenSoulstone;
        this.blueSoulstone = blueSoulstone;
        this.purpleSoulstone = purpleSoulstone;
        this.recipe = [this.emptySoulcage, this.greenSoulstone, this.blueSoulstone, this.purpleSoulstone];
    }
}
