import Orphanage from '../models/Orphanage';
import imageView from './imagesView';

export default {
  render(orphanage: Orphanage) {
    return {
      name: orphanage.name,
      latitude: orphanage.latitude,
      longitude: orphanage.longitude,
      about: orphanage.about,
      instructions: orphanage.instructions,
      opening_hours: orphanage.opening_hours,
      open_on_weekends: orphanage.open_on_weekends,
      images: imageView.renderMany(orphanage.images),
    };
  },

  renderMany(orphanages: Orphanage[]) {
    return orphanages.map((orphanage: Orphanage) => {
      return {
        name: orphanage.name,
        latitude: orphanage.latitude,
        longitude: orphanage.longitude,
        about: orphanage.about,
        instructions: orphanage.instructions,
        opening_hours: orphanage.opening_hours,
        open_on_weekends: orphanage.open_on_weekends,
        images: imageView.renderMany(orphanage.images),
      }
    });
  }
}