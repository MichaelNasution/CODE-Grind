require('../script/rack.js');

describe('ScrabbleRack', () => {
  const { drawTiles, removeTiles } = window.ScrabbleRack;

  describe('drawTiles', () => {
    test('should fill the rack up to 7 tiles from the bag', () => {
      const state = {
        racks: { player: [{ id: 'A-1' }, { id: 'B-2' }] },
        bag: [{ id: 'C-3' }, { id: 'D-4' }, { id: 'E-5' }, { id: 'F-6' }, { id: 'G-7' }]
      };

      drawTiles(state, 'player');

      expect(state.racks.player).toHaveLength(7);
      expect(state.bag).toHaveLength(0);
      expect(state.racks.player).toEqual([
        { id: 'A-1' }, { id: 'B-2' }, 
        { id: 'G-7' }, { id: 'F-6' }, { id: 'E-5' }, { id: 'D-4' }, { id: 'C-3' }
      ]);
    });

    test('should not draw if rack already has 7 tiles', () => {
      const state = {
        racks: { player: [1,2,3,4,5,6,7] },
        bag: [8,9]
      };
      
      drawTiles(state, 'player');
      expect(state.racks.player).toHaveLength(7);
      expect(state.bag).toHaveLength(2);
    });

    test('should only draw available tiles if bag has fewer than needed', () => {
      const state = {
        racks: { player: [{ id: 'A-1' }] },
        bag: [{ id: 'C-3' }, { id: 'D-4' }]
      };

      drawTiles(state, 'player');

      expect(state.racks.player).toHaveLength(3);
      expect(state.bag).toHaveLength(0);
    });
    
    test('should handle empty bag gracefully (negative scenario)', () => {
      const state = {
        racks: { player: [{ id: 'A-1' }] },
        bag: []
      };

      drawTiles(state, 'player');

      expect(state.racks.player).toHaveLength(1);
      expect(state.bag).toHaveLength(0);
    });
  });

  describe('removeTiles', () => {
    test('should remove specified tiles by ID', () => {
      const rack = [{ id: 'A-1' }, { id: 'B-2' }, { id: 'C-3' }];
      removeTiles(rack, ['A-1', 'C-3']);
      expect(rack).toEqual([{ id: 'B-2' }]);
    });

    test('should ignore IDs not found in rack (negative scenario)', () => {
      const rack = [{ id: 'A-1' }, { id: 'B-2' }];
      removeTiles(rack, ['X-99']);
      expect(rack).toEqual([{ id: 'A-1' }, { id: 'B-2' }]);
    });

    test('should handle empty tileIds array gracefully', () => {
      const rack = [{ id: 'A-1' }, { id: 'B-2' }];
      removeTiles(rack, []);
      expect(rack).toEqual([{ id: 'A-1' }, { id: 'B-2' }]);
    });

    test('should handle removing from an empty rack gracefully', () => {
      const rack = [];
      removeTiles(rack, ['A-1']);
      expect(rack).toEqual([]);
    });
  });
});
