
import { IProjectCard } from "./IProjectCard";
import { Tags } from "./Tags";
import { CardType } from "./CardType";
import { Player } from "../Player";
import { Game } from "../Game";
import { TileType } from "../TileType";
import { SelectHowToPay } from "../inputs/SelectHowToPay";
import { SelectSpace } from "../inputs/SelectSpace";
import { ISpace } from "../ISpace";

export class IndustrialCenter implements IProjectCard {
    public cost: number = 4;
    public tags: Array<Tags> = [Tags.STEEL];
    public cardType: CardType = CardType.ACTIVE;
    public name: string = "Industrial Center";
    public actionText: string = "Spend 7 mega credit to increase your steel production 1 step.";
    public text: string = "Place a special tile adjacent to a city tile.";
    public description: string = "Assigned to heavy industry, this area is not the nicest place on Mars";
    private getAvailableSpaces(player: Player, game: Game): Array<ISpace> {
        return game.getAvailableSpacesOnLand(player)
                .filter((space) => game.getAdjacentSpaces(space).filter((adjacentSpace) => adjacentSpace.tile !== undefined && adjacentSpace.tile.tileType === TileType.CITY).length > 0);
    }
    public canPlay(player: Player, game: Game): boolean {
        return this.getAvailableSpaces(player, game).length > 0;
    }
    public play(player: Player, game: Game) {
        if (game.getCitiesInPlayOnMars() === 0) {
            throw "No cities in play";
        }
        return new SelectSpace(this.name, "Select space adjacent to a city tile", this.getAvailableSpaces(player, game), (foundSpace: ISpace) => {
            game.addTile(player, foundSpace.spaceType, foundSpace, { tileType: TileType.SPECIAL });
            return undefined;
        });
    }
    public action(player: Player, _game: Game) {
        if (player.canUseHeatAsMegaCredits && player.heat > 0) {
            if (player.heat + player.megaCredits < 7) {
                throw "Don't have 7 mega credits and heat to spend";
            }
            return new SelectHowToPay(this.name, "Select how to pay for action", false, false, true, (htp) => {
                if (htp.megaCredits + htp.heat < 7) {
                    throw "Need to spend 7";
                }
                player.megaCredits -= 7;
                player.steelProduction++;
                return undefined;
            });
        }
        if (player.megaCredits < 7) {
            throw "Don't have 7 mega credit to spend";
        }
        player.megaCredits -= 7;
        player.steelProduction++;
        return undefined;
    }
}

