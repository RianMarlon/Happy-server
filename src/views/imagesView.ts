import Image from '../models/Image';
import 'dotenv/config';

export default {
  render(image: Image) {
    return {
      id: image.id,
      url: `${process.env.URL_BACKEND}/uploads/${image.path}`,
    };
  },

  renderMany(images: Image[]) {
    return images.map((image: Image) => this.render(image));
  }
}