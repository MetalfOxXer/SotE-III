import { ItemRecipe } from '../ItemRecipe';
import { AgileSlippers } from './AgileSlippers';
import { Item } from '../Item';
import { SpeedPotion } from '../BasicItems/SpeedPotion';

export class ScrollOfAgility extends ItemRecipe {
    private readonly agileSlippers: AgileSlippers;
    private readonly speedPotion: SpeedPotion;
    public readonly recipe: Item[];
    public readonly itemId: number = FourCC('I01H');
    public readonly name: string = 'Scroll of Agility';
    public readonly goldCost: number = 550;
    public readonly iconPath: string = 'ReplaceableTextures\\CommandButtons\\BTNScrollOfHaste.blp';
    public readonly description: string = `A mystical scroll written in an ancient language.

|cffffcc00Movement Speed:|r +200
|cffffcc00Effect:|r Increases movement speed by 50% for 60 seconds.`;

    constructor(agileSlippers: AgileSlippers, speedPotion: SpeedPotion) {
        super();

        this.agileSlippers = agileSlippers;
        this.speedPotion = speedPotion;
        this.recipe = [this.agileSlippers, this.speedPotion];
    }
}
