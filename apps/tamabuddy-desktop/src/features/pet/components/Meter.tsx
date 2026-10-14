import '../pet.css';

export interface MeterProps {
  readonly label: string;
  readonly value: number;
}

export function Meter({ label, value }: MeterProps) {
  return (
    <div className="meter">
      <span>{label}</span>
      <output aria-label={`${label}: ${value} de 4`}>
        {'■'.repeat(value)}
        <span aria-hidden="true">{'·'.repeat(4 - value)}</span>
      </output>
    </div>
  );
}
