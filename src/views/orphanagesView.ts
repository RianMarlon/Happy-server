import Orphanage from '../models/Orphanage';
import imageView from './imagesView';
import convertMinutesToTime from '../utils/convertMinutesToTime';

export default {
  render(orphanage: Orphanage) {
    return {
      id: orphanage.id,
      name: orphanage.name,
      latitude: Number(orphanage.latitude),
      longitude: Number(orphanage.longitude),
      about: orphanage.about,
      whatsapp: orphanage.whatsapp,
      instructions: orphanage.instructions,
      open_from: convertMinutesToTime(orphanage.open_from),
      open_until: convertMinutesToTime(orphanage.open_until),
      open_on_weekends: orphanage.open_on_weekends,
      images: imageView.renderMany(orphanage.images),
    };
  },

  renderMany(orphanages: Orphanage[]) {
    return orphanages.map((orphanage: Orphanage) => this.render(orphanage));
  },
};
