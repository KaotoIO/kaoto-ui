import { calculatePosition, getNextStep } from './visualizationService';

describe('visualizationService', () => {
  it('should calculate the position', () => {
    expect(calculatePosition(0, [], { x: 500, y: 250 }, 160)).toEqual({
      x: 500,
      y: 250,
    });
  });

  it('should get the next step', () => {
    expect(
      getNextStep(
        [
          { data: { label: 'aws-kinesis-so..' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
          { data: { label: 'avro-deseriali..' }, id: 'dndnode_2', position: { x: 880, y: 250 } },
        ],
        { data: { label: 'aws-kinesis-so..' }, id: 'dndnode_1', position: { x: 720, y: 250 } }
      )
    ).toEqual({
      data: { label: 'avro-deseriali..' },
      id: 'dndnode_2',
      position: { x: 880, y: 250 },
    });
  });
});
