import { Card, Character } from './card';

export const mockDukeCard: Card = { character: Character.DUKE, isRevealed: false };
export const mockAssassinCard: Card = { character: Character.ASSASSIN, isRevealed: false };
export const mockCaptainCard: Card = { character: Character.CAPTAIN, isRevealed: false };
export const mockAmbassadorCard: Card = { character: Character.AMBASSADOR, isRevealed: false };
export const mockContessaCard: Card = { character: Character.CONTESSA, isRevealed: false };
export const mockRevealedDuke: Card = { character: Character.DUKE, isRevealed: true };
export const mockRevealedAssassin: Card = { character: Character.ASSASSIN, isRevealed: true };

export const mockHand: Card[] = [mockDukeCard, mockCaptainCard];
export const mockHandWithRevealed: Card[] = [mockRevealedDuke, mockCaptainCard];
