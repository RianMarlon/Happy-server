import Orphanage from '../models/Orphanage';
import imageView from './imagesView';
import convertMinutesToTime from '../utils/convertMinutesToTime';

export default {
  render(orphanage: Orphanage) {
    return {
      id: orphanage.id,
      name: orphanage.name,
      latitude: orphanage.latitude,
      longitude: orphanage.longitude,
      about: orphanage.about,
      instructions: orphanage.instructions,
      open_from: convertMinutesToTime(orphanage.open_from),
      open_until: convertMinutesToTime(orphanage.open_until),
      open_on_weekends: orphanage.open_on_weekends,
      images: imageView.renderMany(orphanage.images),
    };
  },

  renderMany(orphanages: Orphanage[]) {
    return orphanages.map((orphanage: Orphanage) => {
      return {
        id: orphanage.id,
        name: orphanage.name,
        latitude: orphanage.latitude,
        longitude: orphanage.longitude,
        about: orphanage.about,
        instructions: orphanage.instructions,
        open_from: convertMinutesToTime(orphanage.open_from),
        open_until: convertMinutesToTime(orphanage.open_until),
        open_on_weekends: orphanage.open_on_weekends,
        images: imageView.renderMany(orphanage.images),
      }
    });
  }
}