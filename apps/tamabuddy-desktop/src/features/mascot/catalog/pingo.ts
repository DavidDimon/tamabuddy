import type { Stage } from '@tamabuddy/tamabuddy-engine';

import type { MascotVisualKey } from '../mascotManifest.js';
import {
  createMascotManifest,
  type MascotStageDesign,
  type MascotVisualDesign,
} from './createMascotManifest.js';

const CANVAS_WIDTH = 24;
const CANVAS_HEIGHT = 13;

const STAGE_DESIGNS: Readonly<Record<Stage, MascotStageDesign>> = {
  egg: {
    body: ['   .   ', ' .:::. ', '.:::::.', ':::::::', "'-----'"],
    description: 'um pequeno núcleo de água com uma coroa pontuda',
  },
  baby: {
    body: ['   ^   ', ' .:::. ', '/ o o \\', '(  w  )', '\\_____/', "  ' '  "],
    description: 'uma gotinha pequena com uma coroa d’água',
  },
  child: {
    body: [
      '   ^   ',
      ' .:::. ',
      '/ o o \\',
      '(  w  )',
      '\\_____/',
      "'-----'",
      ' /   \\ ',
    ],
    description: 'uma gota curiosa com braços e base arredondada',
  },
  teen: {
    body: [
      ' . ^ . ',
      '.:::::.',
      '/ o o \\',
      '(  w  )',
      '\\_____/',
      "'-----'",
      ' / ^ \\ ',
    ],
    description: 'uma gota alta com crista agitada e postura aventureira',
  },
  adult: {
    body: [
      '. \\|/ .',
      '.-^^^-.',
      '/     \\',
      '| o o |',
      '|  w  |',
      '\\_____/',
      "'-----'",
      '/ / \\ \\',
    ],
    description: 'um elemental d’água desenvolvido cercado por gotas',
  },
  elder: {
    body: [
      ' . ^ . ',
      '.-~~~-.',
      '/     \\',
      '| o o |',
      '|  w  |',
      '\\_____/',
      "'-----'",
      '~~/ \\~~',
    ],
    description: 'uma forma ampla e serena apoiada sobre ondas',
  },
};

const VISUAL_DESIGNS: Readonly<Record<MascotVisualKey, MascotVisualDesign>> = {
  idle: {
    description: 'observa tudo com curiosidade',
    topCues: ['.              .', '  .          .  '],
    fps: 1,
    loop: true,
  },
  happy: {
    description: 'está feliz',
    mouth: 'u',
    topCues: ['*              *', '  *    +    *  '],
    fps: 5,
    loop: false,
  },
  sad: {
    description: 'parece triste',
    mouth: 'n',
    topCues: ['.              .', '                '],
    bottomCue: '.   .',
    fps: 1,
    loop: true,
  },
  hungry: {
    description: 'está com fome',
    mouth: 'O',
    topCues: ['      ?         '],
    bottomCue: '< comida >',
    fps: 1,
    loop: true,
  },
  sleeping: {
    description: 'está dormindo',
    eyes: '-',
    mouth: '_',
    topCues: ['          z     ', '        z Z     '],
    fps: 1,
    loop: true,
  },
  playing: {
    description: 'está brincando',
    mouth: 'u',
    topCues: ['+     *      +  ', '  *      +     *'],
    bottomCue: '/\\',
    fps: 5,
    loop: false,
  },
  eatingMeal: {
    description: 'está comendo uma refeição',
    mouth: 'O',
    topCues: ['                ', '      <=>       '],
    bottomCue: '< refeicao >',
    fps: 4,
    loop: false,
  },
  eatingSnack: {
    description: 'está comendo um lanche',
    mouth: 'o',
    topCues: ['       .        ', '      . .       '],
    bottomCue: '< lanche >',
    fps: 5,
    loop: false,
  },
  cleaning: {
    description: 'está ficando limpinho',
    mouth: 'u',
    topCues: ['+              +', '   +        +   '],
    bottomCue: '~ limpo ~',
    fps: 5,
    loop: false,
  },
  dirty: {
    description: 'precisa de limpeza',
    mouth: 'n',
    topCues: ['     ...        '],
    bottomCue: '... sujeira ...',
    fps: 1,
    loop: true,
  },
  sick: {
    description: 'não está se sentindo bem',
    eyes: '+',
    mouth: '~',
    topCues: ['+              +', '                '],
    bottomCue: '+ ajuda +',
    fps: 1,
    loop: true,
  },
  medicine: {
    description: 'está tomando o remédio',
    mouth: 'O',
    topCues: ['       +        ', '      +++       '],
    bottomCue: '< remedio >',
    fps: 4,
    loop: false,
  },
  discipline: {
    description: 'está ouvindo com atenção',
    mouth: '_',
    topCues: ['       !        ', '      !!!       '],
    fps: 4,
    loop: false,
  },
  attention: {
    description: 'quer sua atenção',
    mouth: 'O',
    topCues: ['      ! !       ', '     !   !      '],
    fps: 2,
    loop: true,
  },
  evolving: {
    description: 'está evoluindo',
    eyes: '*',
    mouth: 'u',
    topCues: ['<<    +    >>   ', '  <<  *  >>     ', '    <<+>>       '],
    bottomCue: '>>> evolui >>>',
    fps: 4,
    loop: false,
  },
  dead: {
    description: 'chegou ao fim de sua jornada',
    eyes: 'x',
    mouth: '_',
    topCues: ['      _____     '],
    bottomCue: '--- fim ---',
    fps: 1,
    loop: false,
  },
};

export const PINGO_MANIFEST = createMascotManifest({
  id: 'pingo',
  name: 'Pingo',
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  colors: {
    primary: 'cyan',
    secondary: 'blue',
    highlight: 'pale-cyan',
  },
  stages: STAGE_DESIGNS,
  visuals: VISUAL_DESIGNS,
});
