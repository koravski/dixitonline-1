import { enumType, objectType } from 'nexus';
import { TurnPhase as TurnPhaseNameEnum } from '../../../domain/reducer';
import { Card } from './card';

export const mapPhaseStateToGraphQL = phase => ({
  name: phase.type,
  board: (phase.board || []).map(({ playerId, ...card }) => ({ card, playerId })),
  clue: phase.clue || '',
  hand: phase.hand,
  players: phase.players.map(player => ({
    ...player,
    score: player.score || 0,
  })),
});

export const TurnPhaseName = enumType({
  name: 'TurnPhaseName',
  members: TurnPhaseNameEnum,
});

export const BoardCard = objectType({
  name: 'TurnBoardCard',
  definition(t) {
    t.field('card', {
      type: Card,
    });
    t.id('playerId');
    t.list.string('votes');
  },
});

export const TurnPlayer = objectType({
  name: 'TurnPlayer',
  definition(t) {
    t.id('id');
    t.string('name');
    t.boolean('readyForNextPhase');
    t.int('score');
  },
});

export const TurnPhase = objectType({
  name: 'TurnPhase',
  definition(t) {
    t.field('name', {
      type: TurnPhaseName,
    });
    t.string('clue');
    t.list.field('board', { type: BoardCard });
    t.list.field('hand', { type: Card });
    t.list.field('players', { type: TurnPlayer });
  },
});