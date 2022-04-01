import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {SelectCard} from '../../inputs/SelectCard';
import {Priority} from '../../deferredActions/DeferredAction';
import {IActionCard} from '../ICard';

export class Odyssey extends Card implements ICorporationCard, IActionCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.ODYSSEY,
      startingMegaCredits: 33,

      metadata: {
        cardNumber: 'PfC18',
        description: 'You start with 33 M€',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(33).br.br;
          b.effect('Your event cards stay face up, and their tags are in use as if the event was an automated card.', (e) => {
            e.empty().startEffect.cards(1, {secondaryTag: Tags.EVENT}).asterix();
          }).br;
          b.action('You may play an event card you have already played that costs 16MC or less, after which, discard that card.', (e) => {
            e.empty().startAction.event({played}).asterix().text('<=16');
          });
        }),
      },
    });
  }

  public availableEventCards(player: Player) {
    return player.playedCards.filter((card) => card.cardType === CardType.EVENT && card.cost <= 16);
  }

  public play() {
    return undefined;
  }

  public canAct(player: Player) {
    return this.availableEventCards(player).length > 0;
  }

  public action(player: Player) {
    return new SelectCard(
      'Select an event card to replay, and then discard',
      'Play',
      this.availableEventCards(player),
      (cards) => {
        const card = cards[0];
        player.game.log('${0} is replaying ${1}', (b) => b.player(player).card(card));
        player.defer(card.play(player), Priority.DEFAULT);
        player.discardPlayedCard(card);
        return undefined;
      },
    );
  }
}
