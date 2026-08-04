// src/data/starterContent.ts

export interface DefenseModuleTemplate {
  id: string;
  name: string;
  description: string;
  unitTestCode: string;
}

export const STARTER_DEFENSE_MODULES: DefenseModuleTemplate[] = [
  {
    id: 'AUTH_TOKEN_SANITIZER',
    name: 'Auth Token Sanitizer',
    description: 'Validates that incoming packet stream contains authentic auth tokens.',
    unitTestCode: `
      const validPacket = { type: "AUTH_TOKEN", payload: "secret_123" };
      const invalidPacket = { type: "MALICIOUS", payload: "drop_table" };
      
      assert(processPacket(validPacket) === "ALLOWED", "Failed to allow valid auth packet!");
      assert(processPacket(invalidPacket) === "DROPPED", "Security Breach: Malicious packet passed through!");
    `,
  },
  {
    id: 'RATE_LIMITER_GUARD',
    name: 'Rate Limiter Guard',
    description: 'Ensures packets with oversized payload footprints are dropped.',
    unitTestCode: `
      const smallPacket = { type: "DATA", sizeMb: 2 };
      const hugePacket = { type: "DATA", sizeMb: 200 };
      
      assert(processPacket(smallPacket) === "ALLOWED", "Small packet dropped incorrectly!");
      assert(processPacket(hugePacket) === "DROPPED", "Rate limit breach: Oversized packet allowed!");
    `,
  },
];