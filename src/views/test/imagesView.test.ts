import Image from '../../modules/images/infra/typeorm/entities/image';
import imagesView from '../imagesView';

describe('imagesView Tests', () => {
  describe('renderMany', () => {
    it('should return correct structure', async () => {
      expect(
        imagesView.renderMany([
          { id: 1, path: 'teste-1.png' },
          { id: 2, path: 'teste-2.png' },
        ] as Image[])
      ).toEqual([
        { id: 1, url: `${process.env.API_URL}/uploads/teste-1.png` },
        { id: 2, url: `${process.env.API_URL}/uploads/teste-2.png` },
      ]);
    });
  });

  describe('render', () => {
    it('should return correct structure', async () => {
      expect(
        imagesView.render({ id: 1, path: 'teste-1.png' } as Image)
      ).toEqual({ id: 1, url: `${process.env.API_URL}/uploads/teste-1.png` });
    });
  });
});
