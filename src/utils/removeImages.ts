import path from 'path';
import fs from 'fs';

export default function(destination: string, filenames: string[]) {
  filenames.forEach((filename) => {
    const filePath = path.resolve(destination, filename);
    if (fs.existsSync(filePath)){
      fs.unlink(filePath, err => {
        if(err) console.log(err);
      });
    }
  });
}