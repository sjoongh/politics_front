// jsdom(jest 27)에 없는 전역 폴리필 — react-router 등 ESM 라이브러리 import용
import { TextEncoder, TextDecoder } from 'util';
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
