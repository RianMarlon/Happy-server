import fsPromises from 'fs/promises';
import path from 'path';

import removeImages from '../removeImages';

describe('removeImages Tests', () => {
  it('should delete the files', async () => {
    await fsPromises.copyFile(
      path.join(__dirname + '../../../../../mocks/file-1.txt'),
      path.join(__dirname + '../../../../../uploads/file-1.txt')
    );
    await fsPromises.copyFile(
      path.join(__dirname + '../../../../../mocks/file-2.txt'),
      path.join(__dirname + '../../../../../uploads/file-2.txt')
    );

    removeImages(path.join(__dirname + '../../../../../uploads'), [
      'file-1.txt',
      'file-2.txt',
    ]);

    await expect(
      fsPromises.readFile(
        path.join(__dirname + '../../../../../uploads/file-1.txt')
      )
    ).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(
      fsPromises.readFile(
        path.join(__dirname + '../../../../../uploads/file-2.txt')
      )
    ).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});
