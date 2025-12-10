
'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

interface SoilDataTableProps {
  soilData: any;
}

const propertyDisplayNames: { [key: string]: string } = {
  bdod: 'Bulk Density',
  cec: 'Cation Exchange Capacity',
  clay: 'Clay Content',
  nitrogen: 'Nitrogen',
  phh2o: 'pH (Water)',
  sand: 'Sand Content',
  silt: 'Silt Content',
  soc: 'Soil Organic Carbon',
};

const getUnit = (layerName: string) => {
    switch (layerName) {
        case 'phh2o':
            return 'pH';
        case 'bdod':
            return 'g/cm³';
        case 'cec':
            return 'cmol/kg';
        case 'soc':
        case 'nitrogen':
        case 'clay':
        case 'sand':
        case 'silt':
            return 'g/kg';
        default:
            return '';
    }
}


export function SoilDataTable({ soilData }: SoilDataTableProps) {
  if (!soilData) {
    return <p className="p-4 text-center">No soil data available.</p>;
  }

  const getTransformedValue = (layerName: string, value: number | undefined) => {
    if (value === null || value === undefined) return "N/A";
    let transformedValue;
    switch (layerName) {
        case 'phh2o': // Value is pH x 10
            transformedValue = value / 10;
            break;
        case 'bdod': // Value is cg/cm³ x 100 -> g/cm3 needs division by 1000 from cg
            transformedValue = value / 100;
            break;
        case 'cec': // Value is cmol(+)/kg x 10
            transformedValue = value / 10;
            break;
        case 'soc': // Value is dg/kg x 10 -> g/kg
            transformedValue = value / 10;
            break;
        case 'nitrogen': // Value is cg/kg x 100 -> g/kg
             transformedValue = value / 100;
            break;
        case 'clay': // Value is g/kg x 10
        case 'sand': // Value is g/kg x 10
        case 'silt': // Value is g/kg x 10
            transformedValue = value / 10;
            break;
        default:
            transformedValue = value;
    }
    return transformedValue.toFixed(2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Soil Property</TableHead>
          <TableHead className="font-bold text-right">Value (0-5cm)</TableHead>
          <TableHead className="font-bold text-right">Value (5-15cm)</TableHead>
          <TableHead className="font-bold text-right">Unit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {soilData.map((layer: any) => (
          <TableRow key={layer.name}>
            <TableCell className="font-medium">
                {propertyDisplayNames[layer.name] || layer.name}
            </TableCell>
            <TableCell className="text-right">
              {getTransformedValue(layer.name, layer.depths[0]?.values?.mean)}
            </TableCell>
            <TableCell className="text-right">
              {getTransformedValue(layer.name, layer.depths[1]?.values?.mean)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
                {getUnit(layer.name)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
