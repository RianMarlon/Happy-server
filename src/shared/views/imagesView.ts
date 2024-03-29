import Image from '../../modules/images/infra/typeorm/entities/image';
import 'dotenv/config';

export default {
  render(image: Image) {
    return {
      id: image.id,
      url: `${process.env.API_URL}/images/orphanages/${image.path}`,
    };
  },

  renderMany(images: Image[]) {
    return images.map((image: Image) => this.render(image));
  },
};
