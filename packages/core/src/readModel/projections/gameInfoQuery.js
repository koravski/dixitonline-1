const { Record, OrderedSet } = require('immutable');
const {
  events: { types: gameEventTypes },
} = require('../domain/game/events');

const GameInfo = Record({
  gameId: undefined,
  remainingCardsInDrawPile: undefined,
  players: OrderedSet([]),
  deck: OrderedSet([]),
});

const Player = Record({
  id: undefined,
  name: undefined,
  points: 0,
});

const reduceToGameInfo = (gameInfo = GameInfo(), event) => {
  switch (event.type) {
    case gameEventTypes.PLAYERS_ORDER_DEFINED:
      return gameInfo.set('players', OrderedSet(event.payload.players.map(player => Player(player))));
    case gameEventTypes.DECK_SHUFFLED:
      return gameInfo.set('deck', OrderedSet(event.payload.shuffledDeck));
    default:
      return gameInfo;
  }
};

const GameInfoQuery = ({ consumeEvents, getStoredGameInfoView }) => {
  const games = {};
  return async gameId => {
    if (!games[gameId]) {
      const gameInfoState = await getStoredGameInfoView(gameId);
      games[gameId] =
        typeof gameInfoState === 'undefined'
          ? GameInfo()
          : GameInfo({
              ...gameInfoState,
              players: OrderedSet(gameInfoState.players),
              deck: OrderedSet(gameInfoState.deck),
            });
      consumeEvents(event => {
        if (
          [gameEventTypes.PLAYERS_ORDER_DEFINED, gameEventTypes.DECK_SHUFFLED].includes(event.type) &&
          event.payload.gameId === gameId
        ) {
          games[gameId] = reduceToGameInfo(games[gameId], event);
        }
      });
    }
    return games[gameId].toJS();
  };
};

module.exports = {
  reduceToGameInfo,
  GameInfoQuery,
  GameInfo,
};