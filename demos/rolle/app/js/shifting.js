// Virtuelles Schalten: rechnet aus Kadenz + virtuellem Gang den passenden Widerstand.
// Zwei Methoden zum Vergleichen:
//   A "ERG": wir rechnen die Watt aus, die du im virtuellen Gang treten müsstest, und schicken sie als Ziel-Watt.
//   B "SIM": wir schicken dem Trainer eine Steigung, die sich im echten Gang so anfühlt wie die Straße im virtuellen Gang.

const G = 9.81;
const RHO = 1.2;
const CDA = 0.32;          // Luftwiderstand Rennrad, Unterlenker grob
const CRR = 0.004;         // Rollwiderstand
const WHEEL = 2.105;       // Radumfang in m (700x25c)

// 24 Gänge wie bei Zwift: Übersetzung (Kettenblatt/Ritzel) von 0,75 bis 5,49
export const GEARS = Array.from({ length: 24 }, (_, i) => +(0.75 * Math.pow(5.49 / 0.75, i / 23)).toFixed(2));

export const speedFrom = (cadence, ratio) => (cadence / 60) * ratio * WHEEL; // m/s

// Kraft am Hinterrad bei Geschwindigkeit v auf einer Straße mit Steigung grade (%)
const roadForce = (v, grade, mass) => mass * G * (grade / 100 + CRR) + 0.5 * RHO * CDA * v * v;

export function ergTarget({ cadence, gear, roadGrade, mass }) {
  if (cadence < 20) return 0;
  const v = speedFrom(cadence, GEARS[gear]);
  return Math.max(0, roadForce(v, roadGrade, mass) * v);
}

// Gang, in dem man bei dieser Trittfrequenz ungefähr diese Watt tritt (für den Startgang beim Selbst schalten)
export function gearFor(watts, cadence = 90, mass = 80) {
  let best = 0;
  GEARS.forEach((_, g) => {
    if (Math.abs(ergTarget({ cadence, gear: g, roadGrade: 0, mass }) - watts) < Math.abs(ergTarget({ cadence, gear: best, roadGrade: 0, mass }) - watts)) best = g;
  });
  return best;
}

// Methode B: Der Trainer misst seine echte Schwungrad-Geschwindigkeit (echter Gang).
// Wir suchen die Steigung, bei der er so viel Kraft macht, dass du dieselben Watt trittst wie im virtuellen Gang.
// Wichtig: Der Trainer rechnet mit einem eigenen Gewicht (trainerMass), das wir nicht kennen → einstellbar.
export function simGrade({ cadence, gear, roadGrade, mass, realRatio, trainerMass }) {
  if (cadence < 20) return roadGrade;
  const vVirt = speedFrom(cadence, GEARS[gear]);
  const vReal = speedFrom(cadence, realRatio);
  const watts = roadForce(vVirt, roadGrade, mass) * vVirt;
  const forceNeeded = watts / vReal;
  const grade = (forceNeeded / (trainerMass * G)) * 100; // crr/cw senden wir als 0
  return Math.max(-10, Math.min(20, grade));
}
