import  geoStarUtil  from '../src/index.js';
const { deepClone } = geoStarUtil;
describe('deepClone.js', () => {
    it('should return a new object with the same properties', () => {
        expect(deepClone({})).toEqual({});

        const mockObject1 = { one: 1 };
        expect(deepClone(mockObject1)).not.toBe(mockObject1);
        expect(deepClone(mockObject1)).toEqual(mockObject1);

        const mockObject2 = { one: 1, arr: ['A', 'B'] };
        expect(deepClone(mockObject2)).toEqual(mockObject2);
    });

    it('should return a new array with the same values', () => {
        expect(deepClone([])).toEqual([]);

        const mockArr1 = [1, 2];
        expect(deepClone(mockArr1)).not.toBe(mockArr1);
        expect(deepClone(mockArr1)).toContain(1);
        expect(deepClone(mockArr1)).toEqual(mockArr1);

        const mockArr2 = ['A', { one: 1 }, { b: 2 }];
        expect(deepClone(mockArr2)).toContain('A');
        expect(deepClone(mockArr2)).toEqual(mockArr2);
    });

    it('should return the same given value for non object args', () => {
        expect(deepClone(1)).toBe(1);
        expect(deepClone('B')).toBe('B');
        expect(deepClone(true)).toBe(true);
    });
});
