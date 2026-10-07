import type { Stage } from '@tamabuddy/tamabuddy-engine';

export interface PingoStageArt {
  readonly art: string;
  readonly description: string;
}

export const PINGO_STAGE_ART: Readonly<Record<Stage, PingoStageArt>> = {
  egg: {
    art: String.raw`
       .
     .::.
    .::::.
   .::::::.
   '------'`,
    description: 'Pingo ainda é um pequeno núcleo de água.',
  },
  baby: {
    art: String.raw`
       ^
     .:::.
    / o o \
   (   w   )
    \_____/
      ' '`,
    description: 'Pingo é uma gotinha pequena com uma coroa d’água.',
  },
  child: {
    art: String.raw`
       . ^ .
      .::::.
     /      \
    /  o  o  \
   (    w     )
    \  ____  /
     '------'
      /    \ `,
    description: 'Pingo está maior, curioso e pronto para brincar.',
  },
  teen: {
    art: String.raw`
    .   ^   .
      .::::.
    ./      \.
   /  o    o  \
  (     w      )
   \  \____/  /
    '--------'
     /  /\  \ `,
    description: 'Pingo ganhou uma crista agitada e uma postura aventureira.',
  },
  adult: {
    art: String.raw`
   .   \ | /   .
     .-^^^^-.
   ./        \.
  /   o    o   \
 (      w       )
  \   \____/   /
   '----------'
    /  /    \  \ `,
    description: 'Pingo domina sua forma elemental e espalha pequenas gotas.',
  },
  elder: {
    art: String.raw`
      .  ^  .
    .-~~~~~~-.
   /          \
  /   o    o   \
 (      -       )
  \   \____/   /
   '----------'
   ~~/      \~~`,
    description: 'Pingo tem uma forma ampla e serena apoiada sobre ondas.',
  },
};
