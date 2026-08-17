export interface MachineSnapshot {
  machine: Machine;
  status: MachineStatus;
  production: Production;
  runtime: Runtime;
  program: Program;
  axisPosition: AxisPosition;
  spindle: Spindle;
  tool: Tool;
  activeAlarm: Alarm | null;
  collectedAt: string;
}

export interface Machine {
  id: number;
  name: string;
  machineCode: string;
  ipAddress: string;
  port: number;
  controllerType: number;
  isEnabled: boolean;
}

export interface MachineStatus {
  state: number;
  emergencyStop: boolean;
  feedHold: boolean;
  cycleStart: boolean;
}

export interface Production {
  partCount: number;
  goodPartCount: number;
  rejectPartCount: number;
  targetQuantity: number;
  actualQuantity: number;
  cycleTime: string;
}

export interface Runtime {
  powerOnTime: string;
  runningTime: string;
  idleTime: string;
  alarmTime: string;
  stoppedTime: string;
  lastCycleStart: string | null;
  lastCycleEnd: string | null;
}

export interface Program {
  programNumber: string;
  programName: string;
  currentBlockNumber: number;
  isRunning: boolean;
  startTime: string | null;
  endTime: string | null;
  progress: number;
  remainingCycleTime: string;
}

export interface AxisPosition {
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  c: number;
  lastUpdated: string;
}

export interface Spindle {
  currentRpm: number;
  targetRpm: number;
  loadPercentage: number;
  power: number;
  temperature: number;
  isRunning: boolean;
  clockwise: boolean;
  lastUpdated: string;
}

export interface Tool {
  toolNumber: number;
  toolName: string;
  toolOffset: number;
  length: number;
  diameter: number;
  lifePercentage: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface Alarm {
  alarmNumber: number;
  message: string;
  level: number;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  description: string;
  controllerAlarmCode: string;
}