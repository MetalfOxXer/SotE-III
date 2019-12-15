import { GameGlobals } from '../Game/GameGlobals';
import { Trigger } from '../JassOverrides/Trigger';
// tslint:disable-next-line: import-name
import items from './ItemRecipeController';
import { ItemRecipe } from './ItemRecipe';

interface ItemInSlot {
    itemId: number;
    includedInRecipe: boolean;
}

interface PlayerInterface {
    heroItems: number[];
    filterItems: ItemRecipe[];

    isMainWindowVisible: boolean;
    isMainButtonVisible: boolean;
    isItemListFiltered: boolean;

    selectedItemRecipeIndex: number | undefined;
    selectedItemFrameIndex: number | undefined;
    currentScrollValue: number;
    itemWindowMin: number;
    itemWindowMax: number;
    itemWindowSize: number;
    previousItemWindowMax: number;
}

// TODO: Refactor
export class RecipeSystem {
    private readonly gameGlobals: GameGlobals;
    private readonly menu: framehandle;
    private readonly itemFrames: framehandle[] = [];
    private readonly itemGoldCost: framehandle[] = [];
    private isLeftClick: boolean = false;
    private mainButton: framehandle;
    private itemRecipeResultDescriptionFrame: framehandle;
    private selectedItemFrame: framehandle | undefined;
    private itemRecipeFrames: framehandle[] = [];
    private itemRecipeGreenBorderFrames: framehandle[] = [];
    private itemRecipeResultUpgradeButton: framehandle;
    private itemRecipeResultIconFrame: framehandle;
    private playerInterface: PlayerInterface[] = [];

    constructor(gameGlobals: GameGlobals) {
        this.gameGlobals = gameGlobals;

        const originFrameGameUi: framehandle = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0);
        this.menu = BlzCreateFrame('EscMenuPopupMenuTemplate', originFrameGameUi, 0, 0);
        const menuBackdrop: framehandle = BlzCreateFrame('EscMenuButtonBackdropTemplate', this.menu, 0, 0);
        const menuTitle: framehandle = BlzCreateFrame('StandardTitleTextTemplate', this.menu, 0, 0);
        const menuScrollbar: framehandle = BlzCreateFrame('EscMenuSliderTemplate', this.menu, 0, 0);
        this.mainButton = BlzCreateFrame('ScoreScreenTabButtonTemplate', originFrameGameUi, 0, 0);
        const mainButtonBackdrop: framehandle = BlzCreateFrameByType('BACKDROP', 'mainButtonBackdrop', this.mainButton, '', 0);

        BlzFrameSetSize(this.menu, 0.5, 0.38);
        BlzFrameSetSize(menuScrollbar, 0.48, 0.02);
        BlzFrameSetPoint(this.menu, FRAMEPOINT_CENTER, originFrameGameUi, FRAMEPOINT_CENTER, 0.0, 0.06);
        BlzFrameSetPoint(menuTitle, FRAMEPOINT_TOP, this.menu, FRAMEPOINT_TOP, 0.0, -0.02);
        BlzFrameSetPoint(menuScrollbar, FRAMEPOINT_BOTTOM, this.menu, FRAMEPOINT_BOTTOM, 0.0, 0.01);
        BlzFrameSetAllPoints(menuBackdrop, this.menu);
        BlzFrameSetVisible(this.menu, false);
        BlzFrameSetSize(this.mainButton, 0.04, 0.04);
        BlzFrameSetPoint(this.mainButton, FRAMEPOINT_BOTTOMLEFT, originFrameGameUi, FRAMEPOINT_BOTTOMLEFT, 0.005, 0.15);
        BlzFrameSetAllPoints(mainButtonBackdrop, this.mainButton);
        BlzFrameSetTexture(mainButtonBackdrop, 'ReplaceableTextures\\CommandButtons\\BTNScroll.blp', 0, true);
        BlzFrameSetText(menuTitle, 'Recipes');
        BlzFrameSetVisible(this.mainButton, false);

        this.itemRecipeResultIconFrame = BlzCreateFrameByType('BACKDROP', 'itemRecipeResultIcon', this.menu, '', 0);
        this.itemRecipeResultDescriptionFrame = BlzCreateFrame('StandardValueTextTemplate', this.menu, 0, 0);
        this.itemRecipeResultUpgradeButton = BlzCreateFrame('ScriptDialogButton', this.menu, 0, 0);
        BlzFrameSetSize(this.itemRecipeResultIconFrame, 0.04, 0.04);
        BlzFrameSetPoint(this.itemRecipeResultIconFrame, FRAMEPOINT_TOPLEFT, this.menu, FRAMEPOINT_TOPLEFT, 0.02, -0.06);
        BlzFrameSetTexture(this.itemRecipeResultIconFrame, 'war3mapImported\\BTNNoItem.blp', 0, true);
        BlzFrameSetPoint(this.itemRecipeResultDescriptionFrame, FRAMEPOINT_TOPLEFT, this.menu, FRAMEPOINT_TOPLEFT, 0.07, -0.06);
        BlzFrameSetTextAlignment(this.itemRecipeResultDescriptionFrame, TEXT_JUSTIFY_LEFT, TEXT_JUSTIFY_TOP);
        BlzFrameSetSize(this.itemRecipeResultDescriptionFrame, 0.41, 0.24);
        BlzFrameSetPoint(this.itemRecipeResultUpgradeButton, FRAMEPOINT_TOPLEFT, this.menu, FRAMEPOINT_TOPLEFT, 0.01, -0.17);
        BlzFrameSetSize(this.itemRecipeResultUpgradeButton, 0.06, 0.03);
        BlzFrameSetEnable(this.itemRecipeResultUpgradeButton, false);

        for (let i: number = 1; i < 7; i++) {
            this.itemRecipeFrames.push(this.createItemRecipeFrame(i));
        }

        for (let i: number = 1; i < 7; i++) {
            this.itemRecipeGreenBorderFrames.push(this.createItemRecipeGreenBorderFrame(i));
        }

        // FIXME: This will crash if items.length ever becomes less than 11
        for (let i: number = 0; i < 11; i++) {
            this.itemFrames.push(this.createItemFrame(this.menu, items[i].iconPath, i));
            this.itemGoldCost.push(this.createItemGoldCostFrame(this.menu, items[i].goldCost, i));
        }

        this.createMainButtonTriggers();
        this.createMainFrameTriggers();
        this.createUpgradeButtonTrigger();

        this.selectedItemFrame = BlzCreateFrameByType('SPRITE', 'selectedItemFrame', this.menu, '', 0);
        BlzFrameSetVisible(this.selectedItemFrame, false);
        BlzFrameSetSize(this.selectedItemFrame, 0.04, 0.04);
        BlzFrameSetPoint(this.selectedItemFrame, FRAMEPOINT_BOTTOMLEFT, this.menu, FRAMEPOINT_BOTTOMLEFT, 0.016, 0.03);
        BlzFrameSetModel(this.selectedItemFrame, 'UI\\Feedback\\Autocast\\UI-ModalButtonOn.mdx', 0);

        const scrollTrigger: Trigger = new Trigger();
        scrollTrigger.registerFrameEvent(menuScrollbar, FRAMEEVENT_SLIDER_VALUE_CHANGED);
        scrollTrigger.addAction(() => {
            const value: number = BlzFrameGetValue(menuScrollbar);
            this.playerInterface[GetPlayerId(GetTriggerPlayer())].currentScrollValue = value;
            this.scrollEvent();
        });

        this.createHeroDropAndPickupItemEvents();
    }

    private scrollEvent(): void {
        const localPlayerId: number = GetPlayerId(GetLocalPlayer());
        const itemArrayLength: number = this.playerInterface[localPlayerId].isItemListFiltered
            ? this.playerInterface[localPlayerId].filterItems.length + 1
            : items.length;
        const itemWindowMaxDifference: number =
            this.playerInterface[localPlayerId].previousItemWindowMax - this.playerInterface[localPlayerId].itemWindowMax;
        this.playerInterface[localPlayerId].itemWindowSize = Math.min(itemArrayLength, this.itemFrames.length);
        this.playerInterface[localPlayerId].itemWindowMax =
            this.playerInterface[localPlayerId].itemWindowSize +
            Math.round(
                this.playerInterface[localPlayerId].currentScrollValue *
                    (itemArrayLength - this.playerInterface[localPlayerId].itemWindowSize),
            ) -
            1;
        this.playerInterface[localPlayerId].previousItemWindowMax = this.playerInterface[localPlayerId].itemWindowMax;
        this.playerInterface[localPlayerId].itemWindowMin =
            this.playerInterface[localPlayerId].itemWindowMax + 1 - this.playerInterface[localPlayerId].itemWindowSize;

        if (this.playerInterface[localPlayerId].selectedItemFrameIndex !== undefined) {
            this.playerInterface[localPlayerId].selectedItemFrameIndex =
                (this.playerInterface[localPlayerId].selectedItemFrameIndex as number) + itemWindowMaxDifference;
        }

        const shouldSelectedItemFrameBeVisible: boolean = !(
            this.playerInterface[localPlayerId].selectedItemFrameIndex === undefined ||
            (this.playerInterface[localPlayerId].selectedItemFrameIndex as number) < 0 ||
            (this.playerInterface[localPlayerId].selectedItemFrameIndex as number) > this.playerInterface[localPlayerId].itemWindowSize - 1
        );

        BlzFrameSetVisible(this.selectedItemFrame as framehandle, shouldSelectedItemFrameBeVisible);
        BlzFrameSetPoint(
            this.selectedItemFrame as framehandle,
            FRAMEPOINT_BOTTOMLEFT,
            this.menu,
            FRAMEPOINT_BOTTOMLEFT,
            0.0175 +
                0.0425 *
                    (this.playerInterface[localPlayerId].selectedItemFrameIndex
                        ? (this.playerInterface[localPlayerId].selectedItemFrameIndex as number)
                        : 0),
            0.03,
        );

        this.updateItemFrames(localPlayerId);
    }

    private getItemFrameTextureString(isOutsideItemArray: boolean, indexedItemWindowMin: number, localPlayerId: number): string {
        if (isOutsideItemArray) {
            return 'war3mapImported\\BTNNoItem.blp';
        }

        if (this.playerInterface[localPlayerId].isItemListFiltered) {
            if (indexedItemWindowMin === 0) {
                return 'war3mapImported\\X.blp';
            }

            return this.playerInterface[localPlayerId].filterItems[indexedItemWindowMin - 1].iconPath;
        }

        return items[indexedItemWindowMin].iconPath;
    }

    private getItemFrameTextString(isOutsideItemArray: boolean, indexedItemWindowMin: number, localPlayerId: number): string {
        if (isOutsideItemArray) {
            return '';
        }

        if (this.playerInterface[localPlayerId].isItemListFiltered) {
            if (indexedItemWindowMin === 0) {
                return '';
            }
            return `|cFFFFCC00${this.playerInterface[localPlayerId].filterItems[indexedItemWindowMin - 1].goldCost}|r`;
        }

        return `|cFFFFCC00${items[indexedItemWindowMin].goldCost}|r`;
    }

    private updateItemFrames(localPlayerId: number): void {
        const itemArrayLength: number = this.playerInterface[localPlayerId].isItemListFiltered
            ? this.playerInterface[localPlayerId].filterItems.length + 1
            : items.length;

        for (let i: number = 0; i < this.itemFrames.length; i++) {
            const indexedItemWindowMin: number = this.playerInterface[localPlayerId].itemWindowMin + i;
            const isOutsideItemArray: boolean = !(indexedItemWindowMin < itemArrayLength);
            const texture: string = this.getItemFrameTextureString(isOutsideItemArray, indexedItemWindowMin, localPlayerId);
            const text: string = this.getItemFrameTextString(isOutsideItemArray, indexedItemWindowMin, localPlayerId);

            BlzFrameSetTexture(this.itemFrames[i], texture, 0, true);
            BlzFrameSetText(this.itemGoldCost[i], text);
            BlzFrameSetVisible(this.itemFrames[i], !isOutsideItemArray);
        }
    }

    private createItemFrame(parent: framehandle, texture: string, index: number): framehandle {
        const itemIcon: framehandle = BlzCreateFrameByType('BACKDROP', 'ItemIcon', parent, '', 0);
        const itemClickFrame: framehandle = BlzCreateFrameByType('BUTTON', 'itemClickFrame', itemIcon, '', 0);
        BlzFrameSetSize(itemIcon, 0.04, 0.04);
        BlzFrameSetPoint(itemIcon, FRAMEPOINT_BOTTOMLEFT, parent, FRAMEPOINT_BOTTOMLEFT, 0.0175 + 0.0425 * index, 0.03);
        BlzFrameSetAllPoints(itemClickFrame, itemIcon);
        BlzFrameSetTexture(itemIcon, texture, 0, true);

        const leftClickTrigger: Trigger = new Trigger();
        leftClickTrigger.registerFrameEvent(itemClickFrame, FRAMEEVENT_CONTROL_CLICK);
        leftClickTrigger.addAction(() => {
            this.isLeftClick = true;
        });

        const clickTrigger: Trigger = new Trigger();
        clickTrigger.registerFrameEvent(itemClickFrame, FRAMEEVENT_MOUSE_UP);
        clickTrigger.addAction(() => {
            BlzFrameSetEnable(itemClickFrame, false);
            BlzFrameSetEnable(itemClickFrame, true);
            if (this.isLeftClick) {
                this.isLeftClick = false;
                this.selectItemEvent(index, GetPlayerId(GetTriggerPlayer()));
            } else {
                this.showRecipesUsingItem(index, GetPlayerId(GetTriggerPlayer()));
            }
        });

        return itemIcon;
    }

    private findRecipeUses(item: ItemRecipe): ItemRecipe[] {
        const result: ItemRecipe[] = [];

        for (let i: number = 0; i < items.length; i++) {
            let hasItem: boolean = false;

            for (let j: number = 0; !hasItem && j < items[i].recipe.length; j++) {
                if (items[i].recipe[j].itemId === item.itemId) {
                    hasItem = true;
                }
            }

            if (hasItem) {
                result.push(items[i]);
            }
        }

        return result;
    }

    private showRecipesUsingItem(index: number, triggerPlayerId: number): void {
        if (!(this.playerInterface[triggerPlayerId].isItemListFiltered && index === 0)) {
            const itemIndex: number =
                index +
                this.playerInterface[triggerPlayerId].previousItemWindowMax +
                1 -
                this.playerInterface[triggerPlayerId].itemWindowSize;
            const itemRecipe: ItemRecipe = this.playerInterface[triggerPlayerId].isItemListFiltered
                ? this.playerInterface[triggerPlayerId].filterItems[itemIndex - 1]
                : items[itemIndex];
            this.playerInterface[triggerPlayerId].isItemListFiltered = true;
            this.playerInterface[triggerPlayerId].filterItems = this.findRecipeUses(itemRecipe);
            this.playerInterface[triggerPlayerId].selectedItemFrameIndex = undefined;
            const localPlayerId: number = GetPlayerId(GetLocalPlayer());
            BlzFrameSetVisible(
                this.selectedItemFrame as framehandle,
                this.playerInterface[localPlayerId].selectedItemFrameIndex !== undefined,
            );
            this.scrollEvent();
            this.updateItemFrames(localPlayerId);
        }
    }

    private createItemGoldCostFrame(parent: framehandle, goldCost: number, index: number): framehandle {
        const itemGoldText: framehandle = BlzCreateFrameByType('TEXT', 'itemGoldText', parent, '', 0);
        BlzFrameSetPoint(itemGoldText, FRAMEPOINT_BOTTOM, parent, FRAMEPOINT_BOTTOMLEFT, 0.04 + 0.0425 * index, 0.07);
        BlzFrameSetText(itemGoldText, `|cFFFFCC00${goldCost}|r`);

        return itemGoldText;
    }

    private findSlotItem(itemSlotArray: ItemInSlot[], itemId: number): ItemInSlot | undefined {
        for (let i: number = 0; i < itemSlotArray.length; i++) {
            if (!itemSlotArray[i].includedInRecipe && itemSlotArray[i].itemId === itemId) {
                return itemSlotArray[i];
            }
        }

        return undefined;
    }

    private selectItemEvent(index: number, triggerPlayerId: number): void {
        const localPlayerId: number = GetPlayerId(GetLocalPlayer());
        if (index === 0 && this.playerInterface[triggerPlayerId].isItemListFiltered) {
            this.playerInterface[triggerPlayerId].isItemListFiltered = false;
            this.playerInterface[triggerPlayerId].selectedItemFrameIndex = undefined;
            this.scrollEvent();
            this.updateItemFrames(localPlayerId);
        } else {
            this.playerInterface[triggerPlayerId].selectedItemFrameIndex = index;
            this.playerInterface[triggerPlayerId].selectedItemRecipeIndex =
                (this.playerInterface[triggerPlayerId].selectedItemFrameIndex as number) +
                this.playerInterface[triggerPlayerId].previousItemWindowMax +
                1 -
                this.playerInterface[triggerPlayerId].itemWindowSize;
        }

        this.selectItem();

        const selectedItemFrameIndex: number | undefined = this.playerInterface[localPlayerId].selectedItemFrameIndex;
        BlzFrameSetPoint(
            this.selectedItemFrame as framehandle,
            FRAMEPOINT_BOTTOMLEFT,
            this.menu,
            FRAMEPOINT_BOTTOMLEFT,
            0.0175 + 0.0425 * (selectedItemFrameIndex ? selectedItemFrameIndex : 0),
            0.03,
        );
        BlzFrameSetVisible(this.selectedItemFrame as framehandle, selectedItemFrameIndex !== undefined);
    }

    private findSelectedItem(selectedItemRecipeIndex: number | undefined, localPlayerId: number): ItemRecipe | undefined {
        if (selectedItemRecipeIndex === undefined) {
            return undefined;
        }

        if (this.playerInterface[localPlayerId].isItemListFiltered) {
            return this.playerInterface[localPlayerId].filterItems[selectedItemRecipeIndex - 1];
        }

        return items[selectedItemRecipeIndex];
    }

    private selectItem(): void {
        let hasAllItems: boolean = true;
        const itemsInSlots: { itemId: number; includedInRecipe: boolean }[] = [];
        const localPlayerId: number = GetPlayerId(GetLocalPlayer());
        const item: ItemRecipe | undefined = this.findSelectedItem(
            this.playerInterface[localPlayerId].selectedItemRecipeIndex,
            localPlayerId,
        );
        BlzFrameSetText(this.itemRecipeResultDescriptionFrame, item ? item.description : '');
        for (let i: number = 0; i < this.playerInterface[localPlayerId].heroItems.length; i++) {
            itemsInSlots.push({
                itemId: this.playerInterface[localPlayerId].heroItems[i],
                includedInRecipe: false,
            });
        }

        for (let i: number = 0; i < this.itemRecipeFrames.length; i++) {
            const foundSlotItem: ItemInSlot | undefined =
                item && item.recipe.length > i ? this.findSlotItem(itemsInSlots, item.recipe[i].itemId) : undefined;
            if (foundSlotItem) {
                foundSlotItem.includedInRecipe = true;
            } else if (item === undefined) {
                hasAllItems = false;
            } else if (i < item.recipe.length) {
                hasAllItems = false;
            }

            const itemRecipeGreenBorderFramesTexture: string = foundSlotItem
                ? 'war3mapImported\\BTNGreenBorder.blp'
                : 'war3mapImported\\BTNGreyedItem.blp';
            BlzFrameSetTexture(this.itemRecipeGreenBorderFrames[i], itemRecipeGreenBorderFramesTexture, 0, true);
            BlzFrameSetVisible(this.itemRecipeGreenBorderFrames[i], true);
            const itemRecipeFramesTexture: string =
                item && item.recipe.length > i ? item.recipe[i].iconPath : 'war3mapImported\\BTNNoItem.blp';
            BlzFrameSetTexture(this.itemRecipeFrames[i], itemRecipeFramesTexture, 0, true);
        }

        BlzFrameSetText(this.itemRecipeResultUpgradeButton, item ? item.goldCost.toString() : '');
        BlzFrameSetEnable(this.itemRecipeResultUpgradeButton, hasAllItems);
        BlzFrameSetTexture(this.itemRecipeResultIconFrame, item ? item.iconPath : 'war3mapImported\\BTNNoItem.blp', 0, true);
    }

    private createItemRecipeFrame(index: number): framehandle {
        const itemIcon: framehandle = BlzCreateFrameByType('BACKDROP', 'ItemIcon', this.menu, '', 0);
        BlzFrameSetSize(itemIcon, 0.02, 0.02);
        const x: number = 0.019 + ((index - 1) % 2) * 0.022;
        const y: number = -0.085 - 0.02 * ((index % 2) + Math.floor(index / 2));
        BlzFrameSetPoint(itemIcon, FRAMEPOINT_TOPLEFT, this.menu, FRAMEPOINT_TOPLEFT, x, y);
        BlzFrameSetTexture(itemIcon, 'war3mapImported\\BTNNoItem.blp', 0, true);

        return itemIcon;
    }

    private createItemRecipeGreenBorderFrame(index: number): framehandle {
        const itemIcon: framehandle = BlzCreateFrameByType('BACKDROP', 'ItemIcon', this.menu, '', 0);
        BlzFrameSetSize(itemIcon, 0.02, 0.02);
        const x: number = 0.019 + ((index - 1) % 2) * 0.022;
        const y: number = -0.085 - 0.02 * ((index % 2) + Math.floor(index / 2));
        BlzFrameSetPoint(itemIcon, FRAMEPOINT_TOPLEFT, this.menu, FRAMEPOINT_TOPLEFT, x, y);
        BlzFrameSetTexture(itemIcon, 'war3mapImported\\BTNGreyedItem.blp', 0, true);

        return itemIcon;
    }

    private createMainButtonTriggers(): void {
        for (let i: number = 0; i < bj_MAX_PLAYERS; i++) {
            this.playerInterface.push({
                heroItems: [],
                filterItems: [],
                isMainWindowVisible: false,
                isMainButtonVisible: false,
                isItemListFiltered: false,
                currentScrollValue: 0,
                selectedItemRecipeIndex: undefined,
                selectedItemFrameIndex: undefined,
                itemWindowMin: 0,
                itemWindowMax: this.itemFrames.length - 1,
                itemWindowSize: this.itemFrames.length,
                previousItemWindowMax: this.itemFrames.length - 1,
            });
            if (this.gameGlobals.PlayerSpawnRegion.length > i) {
                const index: number = i;
                const showMainButtonTrigger: Trigger = new Trigger();
                showMainButtonTrigger.registerEnterRectSimple(this.gameGlobals.PlayerSpawnRegion[i]);
                showMainButtonTrigger.addCondition(
                    () => GetHandleId(GetEnteringUnit()) === GetHandleId(this.gameGlobals.PlayerHero[index]),
                );
                showMainButtonTrigger.addAction(() => {
                    this.playerInterface[index].isMainButtonVisible = true;
                    BlzFrameSetVisible(this.mainButton, this.playerInterface[GetPlayerId(GetLocalPlayer())].isMainButtonVisible);
                });

                const hideMainButtonTrigger: Trigger = new Trigger();
                hideMainButtonTrigger.registerLeaveRectSimple(this.gameGlobals.PlayerSpawnRegion[i]);
                hideMainButtonTrigger.addCondition(() => GetHandleId(GetLeavingUnit()) === GetHandleId(this.gameGlobals.PlayerHero[index]));
                hideMainButtonTrigger.addAction(() => {
                    this.playerInterface[index].isMainButtonVisible = false;
                    this.playerInterface[index].isMainWindowVisible = false;
                    BlzFrameSetVisible(this.mainButton, this.playerInterface[GetPlayerId(GetLocalPlayer())].isMainButtonVisible);
                    BlzFrameSetVisible(this.menu, this.playerInterface[GetPlayerId(GetLocalPlayer())].isMainWindowVisible);
                });
            }
        }
    }

    private createMainFrameTriggers(): void {
        const t: Trigger = new Trigger();
        t.registerFrameEvent(this.mainButton, FRAMEEVENT_CONTROL_CLICK);
        t.addAction(() => {
            const triggerPlayerId: number = GetPlayerId(GetTriggerPlayer());
            this.playerInterface[triggerPlayerId].isMainWindowVisible = !this.playerInterface[triggerPlayerId].isMainWindowVisible;
            BlzFrameSetVisible(this.menu, this.playerInterface[GetPlayerId(GetLocalPlayer())].isMainWindowVisible);
            this.selectItem();

            BlzFrameSetEnable(this.mainButton, false);
            BlzFrameSetEnable(this.mainButton, true);
        });
    }

    private createUpgradeButtonTrigger(): void {
        const upgradeButtonTrigger: Trigger = new Trigger();
        upgradeButtonTrigger.registerFrameEvent(this.itemRecipeResultUpgradeButton, FRAMEEVENT_CONTROL_CLICK);
        upgradeButtonTrigger.addAction(() => {
            const triggerPlayerId: number = GetPlayerId(GetTriggerPlayer());
            const selectedItemForPlayerIndex: number | undefined = this.playerInterface[triggerPlayerId].selectedItemRecipeIndex;
            if (selectedItemForPlayerIndex !== undefined) {
                const itemsInSlots: ItemInSlot[] = [];
                for (let i: number = 1; i < 7; i++) {
                    itemsInSlots.push({
                        itemId: GetItemTypeId(UnitItemInSlotBJ(this.gameGlobals.PlayerHero[triggerPlayerId], i)),
                        includedInRecipe: false,
                    });
                }

                let hasAllItems: boolean = true;
                for (let i: number = 0; i < items[selectedItemForPlayerIndex].recipe.length; i++) {
                    const foundSlotItem: ItemInSlot | undefined = this.findSlotItem(
                        itemsInSlots,
                        items[selectedItemForPlayerIndex].recipe[i].itemId,
                    );

                    if (foundSlotItem) {
                        foundSlotItem.includedInRecipe = true;
                    } else if (i < items[selectedItemForPlayerIndex].recipe.length) {
                        hasAllItems = false;
                    }
                }

                const upgradeGoldCost: number = items[selectedItemForPlayerIndex].goldCost;
                const playerCurrentGold: number = GetPlayerState(GetTriggerPlayer(), PLAYER_STATE_RESOURCE_GOLD);
                if (hasAllItems && playerCurrentGold >= upgradeGoldCost) {
                    SetPlayerState(GetTriggerPlayer(), PLAYER_STATE_RESOURCE_GOLD, playerCurrentGold - upgradeGoldCost);

                    for (let i: number = 0; i < items[selectedItemForPlayerIndex].recipe.length; i++) {
                        RemoveItem(
                            GetItemOfTypeFromUnitBJ(
                                this.gameGlobals.PlayerHero[triggerPlayerId],
                                items[selectedItemForPlayerIndex].recipe[i].itemId,
                            ),
                        );
                    }
                    UnitAddItemById(this.gameGlobals.PlayerHero[triggerPlayerId], items[selectedItemForPlayerIndex].itemId);
                    this.selectItemEvent(this.playerInterface[triggerPlayerId].selectedItemFrameIndex as number, triggerPlayerId);
                }
            }
        });
    }

    private createHeroDropAndPickupItemEvents(): void {
        const dropItemTrigger: Trigger = new Trigger();
        dropItemTrigger.addAction(() => {
            const triggerPlayerId: number = GetPlayerId(GetOwningPlayer(GetTriggerUnit()));
            this.playerInterface[triggerPlayerId].heroItems.splice(
                this.playerInterface[triggerPlayerId].heroItems.indexOf(GetItemTypeId(GetManipulatedItem())),
                1,
            );

            this.selectItem();
        });
        dropItemTrigger.addCondition(() => IsUnitType(GetTriggerUnit(), UNIT_TYPE_HERO));
        dropItemTrigger.registerAnyUnitEventBJ(EVENT_PLAYER_UNIT_DROP_ITEM);

        const pickupItemTrigger: Trigger = new Trigger();
        pickupItemTrigger.addAction(() => {
            const triggerPlayerId: number = GetPlayerId(GetOwningPlayer(GetTriggerUnit()));
            this.playerInterface[triggerPlayerId].heroItems.push(GetItemTypeId(GetManipulatedItem()));

            this.selectItem();
        });
        pickupItemTrigger.addCondition(() => IsUnitType(GetTriggerUnit(), UNIT_TYPE_HERO));
        pickupItemTrigger.registerAnyUnitEventBJ(EVENT_PLAYER_UNIT_PICKUP_ITEM);
    }
}
