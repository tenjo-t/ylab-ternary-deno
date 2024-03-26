export type Data = { data: [number, number, number][]; color: string }[];

export type Labels = [string, string, string];

export type Domains = [
  [number, number],
  [number, number],
  [number, number],
];

export type Ticks = number;

export type Legend = {
  color: (n: number) => string;
  domain: [number, number];
  ticks: number;
};
