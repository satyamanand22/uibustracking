export interface OperatorSession {
  operatorId: string;
  name: string;
  role: string;
  clearance: string;
  sector: string;
  loginTime: string;
  pingMs?: number;
  nodeCluster?: string;
  encryptedToken?: string;
}

export interface DemoOperator {
  id: string;
  name: string;
  role: string;
  clearance: string;
  sector: string;
  code: string;
  unitCount: number;
}
