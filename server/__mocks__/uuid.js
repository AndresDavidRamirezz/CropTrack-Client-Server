// ==================== MOCK DE UUID PARA JEST ====================
// uuid v13 es ESM-only y causa problemas con Jest en Windows
// Este mock usa crypto.randomUUID() de Node.js que funciona sin problemas

import { randomUUID } from 'crypto';

export const v4 = () => randomUUID();

export default { v4 };
